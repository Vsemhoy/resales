import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { formLogger, LOG_TYPE_CONFIG } from '../../../components/helpers/FormLogger';
import { ANTD_PAGINATION_LOCALE } from '../../../config/Localization';
import { 
  Button, DatePicker, Input, Pagination, Select, Space, Tag, 
  Tooltip, Modal, Collapse, Empty, Spin, Popconfirm, message, 
  Checkbox, Progress,
  Affix
} from 'antd';
import { 
  CaretLeftOutlined, CaretRightOutlined, DownloadOutlined,
  DeleteOutlined, ReloadOutlined, CopyOutlined,
  ExclamationCircleOutlined, CheckCircleOutlined,
  SettingOutlined, DatabaseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import "./components/style/locallogger.css";

// Типы для селекта
const typeSelects = [
  { value: "PAGE_OPEN", label: "📂 Открытие страницы" },
  { value: "PAGE_CLOSE", label: "📁 Закрытие страницы" },
  // { value: "TAB_CHANGE", label: "📑 Смена таба" },
  { value: "EDIT_MODE_ENTER", label: "✏️ Начало редактирования" },
  { value: "EDIT_MODE_EXIT", label: "✅ Конец редактирования" },
  { value: "FORM_SNAPSHOT", label: "📸 Снимок формы" },
  // { value: "AUTO_SNAPSHOT", label: "⏱️ Автоснимок" },
  // { value: "EMERGENCY_SNAPSHOT", label: "🆘 Экстренный снимок" },
  { value: "BEFORE_SAVE", label: "💾Запрос на сохранение" },
  { value: "SAVE_SUCCESS", label: "✅ Сохранено успешно" },
  { value: "SAVE_ERROR", label: "❌ Ошибка сохранения" },
  // { value: "ERROR", label: "⚠️ Ошибка" },
  // { value: "ITEM_ADD", label: "➕ Добавление" },
  // { value: "ITEM_DELETE", label: "➖ Удаление" },
  // { value: "ITEM_UPDATE", label: "🔄 Обновление" },
  { value: "CURATOR_REQUEST", label: "👤 Запрос кураторства" },
  { value: "CURATOR_REQUEST_RESULT", label: "👥 Результат кураторства" },
  { value: "CURATOR_REQUEST_FAILED", label: "👤❌ Ошибка кураторства" },
];

const LocalLogger = ({ userdata }) => {
  // Инициализация пользователя
  useEffect(() => {
    formLogger.setUser(
      userdata?.user?.id,
      `${userdata?.user?.surname} ${userdata?.user?.name}`,
      userdata?.user?.active_role
    );
  }, [userdata]);

  // Состояния
  const [filters, setFilters] = useState({
    name: '',
    comId: '',
    types: [],
    date: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [onPage, setOnPage] = useState(50);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [heatmapData, setHeatmapData] = useState({});
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(null);
  const [captchaQuestion, setCaptchaQuestion] = useState('');

  // Настройки логгера (из FormLogger)
  const [settings, setSettings] = useState(() => formLogger.getSettings());

  // Загрузка данных
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams = {
        name: filters.name || undefined,
        comState: filters.comId ? { id: String(filters.comId) } : undefined,
        action: filters.types.length > 0 ? filters.types : undefined,
        date: filters.date ? filters.date.format('YYYY-MM-DD') : undefined,
        page: currentPage,
        limit: onPage,
      };

      const [result, totalCount, heatmap, statsData, healthData] = await Promise.all([
        formLogger.getLogs(filterParams),
        formLogger.getLogsCount(filterParams),
        formLogger.getHeatmapData(90),
        formLogger.getStats(),
        formLogger.getHealth()
      ]);

      setLogs(result);
      setTotal(totalCount);
      setHeatmapData(heatmap);
      setStats(statsData);
      setHealth(healthData);
    } catch (e) {
      console.error('Ошибка загрузки логов:', e);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, onPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Обработчики настроек
  const handleSettingChange = useCallback((key, value) => {
    const newSettings = formLogger.updateSettings({ [key]: value });
    setSettings(newSettings);
    message.success('Настройки сохранены');
    // Обновляем health после изменения настроек
    formLogger.getHealth().then(setHealth);
  }, []);

  // Обработчики фильтров
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const moveDate = (delta) => {
    const newDate = filters.date 
      ? filters.date.add(delta, 'day') 
      : dayjs().add(delta, 'day');
    handleFilterChange('date', newDate);
  };

  const handleHeatmapClick = (date) => {
    handleFilterChange('date', dayjs(date));
  };

  // Очистка логов
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaAnswer(a + b);
    setCaptchaValue('');
    return `${a} + ${b} = ?`;
  };

  const openClearModal = () => {
    setCaptchaQuestion(generateCaptcha());
    setClearModalOpen(true);
  };

  const handleClearAll = async () => {
    if (parseInt(captchaValue) !== captchaAnswer) {
      message.error('Неверный ответ капчи');
      return;
    }
    
    await formLogger.clearAll();
    message.success('Все логи очищены');
    setClearModalOpen(false);
    loadData();
  };

  const handleClearOld = async (days) => {
    const count = await formLogger.clearOlderThan(days);
    message.success(`Удалено ${count} логов старше ${days} дней`);
    loadData();
  };

  // Экспорт
  const handleExport = async () => {
    const filterParams = {
      name: filters.name || undefined,
      comState: filters.comId ? { id: String(filters.comId) } : undefined,
      action: filters.types.length > 0 ? filters.types : undefined,
      date: filters.date ? filters.date.format('YYYY-MM-DD') : undefined,
    };
    await formLogger.exportToFile(null, filterParams);
    message.success('Файл скачан');
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setFilters({ name: '', comId: '', types: [], date: null });
  };

  return (
    <div className="sa-loclog-page">
      {/* Заголовок и статистика */}
      <div className="sa-loclog-header">
        <div className="sa-loclog-title">
          <span className="sa-loclog-name">📊 Star-Logger</span>
          {stats && (
            <span className="sa-loclog-stats">
              Записей: {stats.totalLogs} | 
              Размер: {stats.dbSize?.usedMB || '0'} MB / {settings.maxSizeMB} MB
            </span>
          )}
          {health && (
            <Tag color={
              health.status === 'ok' ? 'green' : 
              health.status === 'warning' ? 'orange' : 'red'
            }>
              {health.message}
            </Tag>
          )}
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => loadData()}>
            Обновить
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Экспорт
          </Button>
          <Popconfirm
            title="Очистить логи старше 30 дней?"
            onConfirm={() => handleClearOld(30)}
            okText="Да"
            cancelText="Нет"
          >
            <Button>Очистить &gt;30 дней</Button>
          </Popconfirm>
          <Button danger icon={<DeleteOutlined />} onClick={openClearModal}>
            Очистить всё
          </Button>
        </Space>
      </div>

      {/* Heatmap + Настройки */}
      <div className="sa-loclog-heatmap">
        {/* Heatmap Calendar */}
        <HeatmapCalendar 
          data={heatmapData} 
          onDateClick={handleHeatmapClick}
          selectedDate={filters.date?.format('YYYY-MM-DD')}
        />

        {/* Панель настроек */}
        <SettingsPanel 
          settings={settings}
          health={health}
          onSettingChange={handleSettingChange}
        />
      </div>

      {/* Фильтры */}
      <Affix offsetTop={1} >
      <div className="sa-loclog-toolbar">
        <Space size="middle" wrap>
          <Input
            allowClear
            value={filters.comId}
            placeholder="ID компании"
            onChange={(e) => handleFilterChange('comId', e.target.value)}
            style={{ width: 120 }}
          />
          <Input
            allowClear
            value={filters.name}
            placeholder="Название компании"
            onChange={(e) => handleFilterChange('name', e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Тип действия"
            value={filters.types}
            onChange={(value) => handleFilterChange('types', value || [])}
            options={typeSelects}
            style={{ minWidth: 250 }}
            maxTagCount={2}
          />
          <Space.Compact>
            <Button icon={<CaretLeftOutlined />} onClick={() => moveDate(-1)} />
            <DatePicker
              allowClear
              value={filters.date}
              onChange={(date) => handleFilterChange('date', date)}
              style={{ width: 140 }}
              placeholder="Дата"
            />
            <Button icon={<CaretRightOutlined />} onClick={() => moveDate(1)} />
          </Space.Compact>
        </Space>
      </div>
      </Affix>

<div style={{ position: 'static', transform: 'none' }}>
  <Affix offsetTop={60}>
      {/* Пагинация */}
      <div className="sa-loclog-paginate">
        <Pagination
          size="small"
          current={currentPage}
          pageSize={onPage}
          pageSizeOptions={[25, 50, 100]}
          locale={ANTD_PAGINATION_LOCALE}
          showQuickJumper
          total={total}
          showTotal={(t) => `Записей: ${t}`}
          onChange={(page, pageSize) => {
            setCurrentPage(page);
            setOnPage(pageSize);
          }}
          disabled={loading}
        />
      </div>

      </Affix>
      </div>

      {/* Контент */}
      <Spin spinning={loading}>
        <div className="sa-loclog-content">
          {logs.length === 0 ? (
            <Empty description="Нет записей" />
          ) : (
            logs.map((item) => (
              <LogItem key={item.id} log={item} />
            ))
          )}
        </div>
      </Spin>

      {/* Модал очистки */}
      <Modal
        title="⚠️ Очистка всех логов"
        open={clearModalOpen}
        onCancel={() => setClearModalOpen(false)}
        onOk={handleClearAll}
        okText="Очистить"
        okButtonProps={{ danger: true }}
        cancelText="Отмена"
      >
        <p>Это действие удалит <strong>ВСЕ</strong> логи без возможности восстановления.</p>
        <p>Решите пример для подтверждения:</p>
        <Space>
          <span style={{ fontSize: 18 }}>{captchaQuestion}</span>
          <Input
            value={captchaValue}
            onChange={(e) => setCaptchaValue(e.target.value)}
            style={{ width: 80 }}
            placeholder="Ответ"
          />
        </Space>
      </Modal>
    </div>
  );
};


// =============================================================================
// ПАНЕЛЬ НАСТРОЕК
// =============================================================================

const SettingsPanel = ({ settings, health, onSettingChange }) => {
  // Опции для селекта дней хранения
  const daysOptions = useMemo(() => {
    const options = [];
    for (let i = 5; i <= 90; i += 5) {
      options.push({ value: i, label: `${i} дней` });
    }
    return options;
  }, []);

  // Опции для размера БД (5-100 MB)
  const sizeOptions = useMemo(() => {
    const options = [];
    for (let i = 5; i <= 100; i += 5) {
      options.push({ value: i, label: `${i} MB` });
    }
    return options;
  }, []);

  const sizePercent = health?.size?.percent ? parseFloat(health.size.percent) : 0;
  const currentSize = health?.size?.current || '0';

  return (
    <div className="sa-log-cog-panel">
      <div className="sa-log-cog-panel-header">
        <SettingOutlined /> Настройки логгера
      </div>

      <div className='sa-log-cog-panel-item-columns'>
        <div>
      {/* Включить/выключить логирование */}
            <div className="sa-log-cog-panel-item">
              <Checkbox
                checked={settings.enabled}
                onChange={(e) => onSettingChange('enabled', e.target.checked)}
                className="sa-log-cog-panel-label"
              >
                Включить локальное логгирование
              </Checkbox>
            </div>

            {/* Сохранять снимки форм */}
            {settings.enabled && (
            <div className="sa-log-cog-panel-item">
              <Checkbox
                checked={settings.saveSnapshots}
                disabled={!settings.enabled}
                onChange={(e) => onSettingChange('saveSnapshots', e.target.checked)}
                className="sa-log-cog-panel-label"
              >
                Сохранять снимки форм
              </Checkbox>
              <div className="sa-log-cog-panel-hint">
                Снимки занимают много места, но помогают восстановить данные
              </div>
            </div>
            )}


                {/* Предупреждение если отключено */}
            {!settings.enabled && (
              <div className="sa-log-cog-panel-warning">
                ⚠️ Логирование отключено. Данные не сохраняются.
              </div>
            )}

        </div>
        <div>
          {/* Время хранения логов */}
          <div className="sa-log-cog-panel-item">
            <div className="sa-log-cog-panel-label">
              Время хранения логов:
            </div>
            <Select
              value={settings.maxAgeDays}
              disabled={!settings.enabled}
              onChange={(value) => onSettingChange('maxAgeDays', value)}
              options={daysOptions}
              style={{ width: '100%' }}
            />
          </div>

          {/* Максимальный размер БД */}
          <div className="sa-log-cog-panel-item">
            <div className="sa-log-cog-panel-label">
              <DatabaseOutlined /> Макс. размер БД:
            </div>
            <Select
              value={settings.maxSizeMB}
              disabled={!settings.enabled}
              onChange={(value) => onSettingChange('maxSizeMB', value)}
              options={sizeOptions}
              style={{ width: '100%' }}
            />

          </div>
        </div>
      </div>
     
            <div className="sa-log-cog-panel-progress">
              <Progress 
                percent={Math.min(100, sizePercent)} 
                size="small"
                status={
                  sizePercent > 90 ? 'exception' : 
                  sizePercent > 70 ? 'active' : 'normal'
                }
                format={() => `${currentSize} / ${settings.maxSizeMB} MB`}
              />
            </div>



    </div>
  );
};


// =============================================================================
// КОМПОНЕНТ HEATMAP КАЛЕНДАРЯ
// =============================================================================

const HeatmapCalendar = ({ data, onDateClick, selectedDate }) => {
  const days = useMemo(() => {
    const result = [];
    const today = dayjs();
    
    for (let i = 89; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      const count = data[dateStr] || 0;
      
      result.push({
        date: dateStr,
        dayOfWeek: date.day(),
        dayOfMonth: date.date(),
        month: date.month(),
        count,
        level: getHeatLevel(count),
      });
    }
    
    return result;
  }, [data]);

  const weeks = useMemo(() => {
    const result = [];
    let currentWeek = [];
    
    days.forEach((day, index) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6 || index === days.length - 1) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return result;
  }, [days]);

  return (
    <div className="sa-loclog-heatmap-container">
      <div className="sa-loclog-heatmap-label">Активность за 90 дней:</div>
      <div className="sa-loclog-heatmap-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="sa-loclog-heatmap-week">
            {week.map((day) => (
              <Tooltip 
                key={day.date} 
                title={`${day.date}: ${day.count} записей`}
              >
                <div
                  className={`sa-loclog-heatmap-day level-${day.level} ${selectedDate === day.date ? 'selected' : ''}`}
                  onClick={() => onDateClick(day.date)}
                />
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      <div className="sa-loclog-heatmap-legend">
        <span>Меньше</span>
        <div className="sa-loclog-heatmap-day level-0" />
        <div className="sa-loclog-heatmap-day level-1" />
        <div className="sa-loclog-heatmap-day level-2" />
        <div className="sa-loclog-heatmap-day level-3" />
        <div className="sa-loclog-heatmap-day level-4" />
        <span>Больше</span>
      </div>
    </div>
  );
};

const getHeatLevel = (count) => {
  if (count === 0) return 0;
  if (count < 5) return 1;
  if (count < 20) return 2;
  if (count < 50) return 3;
  return 4;
};


// =============================================================================
// КОМПОНЕНТ ЗАПИСИ ЛОГА
// =============================================================================

const LogItem = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  
  const config = LOG_TYPE_CONFIG[log.action] || { 
    label: log.action, 
    color: '#d9d9d9', 
    icon: '📄' 
  };

  const time = dayjs(log.timestamp).format('HH:mm:ss');
  const date = dayjs(log.timestamp).format('DD.MM.YYYY');

  const companyName = log.comState?.name || log.data?.main?.name || '...';
  const companyId = log.comState?.id || '—';

  const handleCopyJson = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    message.success('JSON скопирован');
  };

  return (
    <div className={`sa-loclog-item ${expanded ? 'expanded' : ''}`}>
      {/* Заголовок */}
      <div className="sa-loclog-item-header" onClick={() => setExpanded(!expanded)}>
        <div className="sa-loclog-item-left">
          <div className="sa-flex">
            <span className="sa-loc-comid">{companyId}</span>
            <Tag color={config.color} className="sa-loclog-type-tag">
              {config.icon} {config.label}
            </Tag>
          </div>
          <span className="sa-loclog-item-company">
            <strong>{companyName}</strong>
          </span>
        </div>
        <div className="sa-loclog-item-right">
          {/* <span className="sa-loclog-item-user">{log.userName || '—'}</span> */}
          <span className="sa-loclog-item-datetime">
            <span className="sa-loclog-item-date">{date}</span>
            <span className="sa-loclog-item-time">{time}</span>
          </span>
        </div>
      </div>

      {/* Развёрнутое содержимое */}
      {expanded && (
        <div className="sa-loclog-item-body">
          <div className="sa-loclog-item-meta">
            <span>Session: {log.sessionId}</span>
            <span>User ID: {log.userId}</span>
            <span>Role: {log.userRole}</span>
            <Button 
              size="small" 
              icon={<CopyOutlined />} 
              onClick={handleCopyJson}
            >
              Копировать JSON
            </Button>
          </div>

          <LogDataRenderer log={log} />
        </div>
      )}
    </div>
  );
};


// =============================================================================
// РЕНДЕРЕР ДАННЫХ В ЗАВИСИМОСТИ ОТ ТИПА
// =============================================================================

const LogDataRenderer = ({ log }) => {
  const { action, data } = log;

  switch (action) {
    case 'PAGE_OPEN':
    case 'PAGE_CLOSE':
      return (
        <div className="sa-loclog-data-simple">
          <div>Страница: {log.meta?.pathname || '—'}</div>
          {data?.orgId && <div>Org ID: {data.orgId}</div>}
        </div>
      );

    case 'TAB_CHANGE':
      return (
        <div className="sa-loclog-data-simple">
          <Tag>Было: {data?.from || '—'}</Tag>
          <span style={{ margin: '0 8px' }}>→</span>
          <Tag color="blue">Стало: {data?.to || '—'}</Tag>
        </div>
      );

    case 'BEFORE_SAVE':
    case 'FORM_SNAPSHOT':
    case 'AUTO_SNAPSHOT':
    case 'EMERGENCY_SNAPSHOT':
      return <FormSnapshotRenderer data={data} />;

    case 'SAVE_SUCCESS':
      return (
        <div className="sa-loclog-data-success">
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
          <span>Данные успешно сохранены</span>
          {data?.status && <Tag color="green">Status: {data.status}</Tag>}
        </div>
      );

    case 'SAVE_ERROR':
    case 'ERROR':
    case 'CURATOR_REQUEST_FAILED':
      return <ErrorRenderer data={data} />;

    case 'CURATOR_REQUEST':
    case 'CURATOR_REQUEST_RESULT':
      return <JsonTreeViewer data={data} title="Данные запроса" />;

    default:
      return <JsonTreeViewer data={data} title="Данные" />;
  }
};


// =============================================================================
// РЕНДЕРЕР СНИМКА ФОРМЫ
// =============================================================================

const FormSnapshotRenderer = ({ data }) => {
  // console.log(data);
  if (!data || typeof data !== 'object') {
    return <div className="sa-loclog-data-empty">Нет данных</div>;
  }

  const sections = Object.entries(data);

  if (sections.length === 0) {
    return <div className="sa-loclog-data-empty">Пустой снимок</div>;
  }

  return (
    <div className="sa-loclog-form-snapshot">
      <Collapse size="small" ghost>
        {sections.map(([key, value]) => {
          const isArray = Array.isArray(value);
          const count = isArray ? value.length : null;
          
          return (
            <Collapse.Panel 
              key={key} 
              header={
                <span>
                  <strong>{key}</strong>
                  {count !== null && <Tag style={{ marginLeft: 8 }}>{count} шт.</Tag>}
                </span>
              }
            >
              {isArray ? (
                <ArrayRenderer items={value} />
              ) : typeof value === 'object' ? (
                <JsonTreeViewer data={value} />
              ) : (
                <div className="sa-loclog-scalar-value">{String(value)}</div>
              )}
            </Collapse.Panel>
          );
        })}
      </Collapse>
    </div>
  );
};


// =============================================================================
// РЕНДЕРЕР МАССИВОВ
// =============================================================================

const ArrayRenderer = ({ items }) => {
  if (!items || items.length === 0) {
    return <div className="sa-loclog-data-empty">Пустой массив</div>;
  }

  return (
    <div className="sa-loclog-array">
      {items.map((item, index) => {
        const command = item.command;
        const isNew = String(item.id).startsWith('new_');
        const isDeleted = item.deleted === 1;

        let tagColor = 'default';
        let tagText = '';
        
        if (command === 'create' || isNew) {
          tagColor = 'green';
          tagText = 'Новый';
        } else if (command === 'delete' || isDeleted) {
          tagColor = 'red';
          tagText = 'Удалён';
        } else if (command === 'update') {
          tagColor = 'orange';
          tagText = 'Изменён';
        }

        const displayName = item.name || item.lastname || item.number || item.email || `#${item.id}`;

        return (
          <div key={index} className={`sa-loclog-array-item ${command || ''}`}>
            <div className="sa-loclog-array-item-header">
              <span>{displayName}</span>
              {tagText && <Tag color={tagColor}>{tagText}</Tag>}
            </div>
            <Collapse size="small" ghost>
              <Collapse.Panel header="Подробнее" key="1">
                <JsonTreeViewer data={item} />
              </Collapse.Panel>
            </Collapse>
          </div>
        );
      })}
    </div>
  );
};


// =============================================================================
// РЕНДЕРЕР ОШИБОК
// =============================================================================

const ErrorRenderer = ({ data }) => {
  return (
    <div className="sa-loclog-error">
      <div className="sa-loclog-error-header">
        <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
        <div>
          <div className="sa-loclog-error-type">{data?.errorType || 'Ошибка'}</div>
          <div className="sa-loclog-error-message">{data?.message || '—'}</div>
        </div>
      </div>
      
      {data?.responseStatus && (
        <Tag color="red">HTTP {data.responseStatus}</Tag>
      )}
      
      {data?.context && (
        <Collapse size="small" ghost style={{ marginTop: 8 }}>
          <Collapse.Panel header="Контекст ошибки">
            <JsonTreeViewer data={data.context} />
          </Collapse.Panel>
        </Collapse>
      )}
      
      {data?.stack && (
        <Collapse size="small" ghost>
          <Collapse.Panel header="Stack trace">
            <pre className="sa-loclog-stack">{data.stack}</pre>
          </Collapse.Panel>
        </Collapse>
      )}
    </div>
  );
};


// =============================================================================
// УНИВЕРСАЛЬНЫЙ JSON VIEWER
// =============================================================================

const JsonTreeViewer = ({ data, title }) => {
  const [expanded, setExpanded] = useState(false);

  if (data === null || data === undefined) {
    return <span className="sa-loclog-null">null</span>;
  }

  if (typeof data !== 'object') {
    return <span className="sa-loclog-scalar">{String(data)}</span>;
  }

  const preview = JSON.stringify(data).slice(0, 100);

  return (
    <div className="sa-loclog-json-tree">
      {title && <div className="sa-loclog-json-title">{title}</div>}
      
      {!expanded ? (
        <div 
          className="sa-loclog-json-preview" 
          onClick={() => setExpanded(true)}
        >
          {preview}{preview.length >= 100 && '...'}
          <Button size="small" type="link">Развернуть</Button>
        </div>
      ) : (
        <div className="sa-loclog-json-expanded">
          <Button 
            size="small" 
            type="link" 
            onClick={() => setExpanded(false)}
            style={{ marginBottom: 4 }}
          >
            Свернуть
          </Button>
          <pre className="sa-loclog-json-code">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};


export default LocalLogger;
