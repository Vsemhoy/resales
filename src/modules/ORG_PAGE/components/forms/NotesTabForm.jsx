/**
 * NotesTabForm.jsx - Вкладка заметок на Ant Design Form
 * 
 * АРХИТЕКТУРА:
 * - Один Form.useForm() на всю вкладку (передаётся от родителя)
 * - Form.List для массива заметок
 * - Данные хранятся в форме, не в локальных useState
 * 
 * ПРАВИЛА:
 * - Чужие заметки редактировать нельзя
 * - Свои заметки удалять нельзя (если уже в БД)
 * - Новые заметки (id начинается с 'new_') можно удалять
 * 
 * СТИЛИ: используем префикс sat- (orgpage-forms.css)
 */
import _ from 'lodash';
import debounce from 'lodash/debounce';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Form, Button, Input, DatePicker, Pagination, 
  Spin, Empty, message 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

import { PROD_AXIOS_INSTANCE } from '../../../../config/Api';
import { CSRF_TOKEN, PRODMODE } from '../../../../config/config';
import { MODAL_NOTES_LIST } from '../../../ORG_LIST/components/mock/MODALNOTESTABMOCK';
import { ANTD_PAGINATION_LOCALE } from '../../../../config/Localization';

import '../style/orgpage-forms.css';

const { TextArea } = Input;

// Конфиг
const TEXTAREA_MIN_ROWS = 3;
const TEXTAREA_MAX_ROWS = 10;
const CHEVRON_SIZE = 16;


const NotesTabForm = ({ 
  form,           // Form instance от родителя
  orgId,          // ID организации
  editMode,       // Режим редактирования
  isActive,       // Активна ли вкладка
  userdata,       // Данные пользователя
  onDataChange,   // Callback при изменении данных
}) => {
  // Состояния загрузки и пагинации
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  
  // Оригинальные данные для сравнения
  const [originalData, setOriginalData] = useState([]);
  
  // UI состояния
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [newItemLoading, setNewItemLoading] = useState(false);

  // ===================== ЗАГРУЗКА ДАННЫХ =====================
  
  const loadNotes = useCallback(async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      if (PRODMODE) {
        const response = await PROD_AXIOS_INSTANCE.post(
          `/api/sales/v2/orglist/${orgId}/n`,
          {
            data: { page: currentPage, limit: pageSize },
            _token: CSRF_TOKEN,
          }
        );
        
        if (response.data?.content?.notes) {
          const notes = response.data.content.notes;
          setOriginalData(JSON.parse(JSON.stringify(notes)));
          setTotal(response.data.total || notes.length);
          
          form.setFieldsValue({ 
            existingNotes: notes,
            newNotes: [] 
          });
        }
      } else {
        // DEV MODE - используем мок
        const notes = MODAL_NOTES_LIST.notes;
        setOriginalData(JSON.parse(JSON.stringify(notes)));
        setTotal(notes.length);
        
        form.setFieldsValue({ 
          existingNotes: notes,
          newNotes: [] 
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки заметок:', error);
      message.error('Не удалось загрузить заметки');
    } finally {
      setLoading(false);
    }
  }, [orgId, currentPage, pageSize, form]);

  // Загрузка при изменении orgId или пагинации
  useEffect(() => {
    if (orgId) {
      const timer = setTimeout(loadNotes, 300);
      return () => clearTimeout(timer);
    }
  }, [orgId, currentPage, pageSize, loadNotes]);

  // Сброс при смене организации
  useEffect(() => {
    if (!orgId) {
      form.setFieldsValue({ existingNotes: [], newNotes: [] });
      setOriginalData([]);
      setExpandedKeys([]);
    }
  }, [orgId, form]);

  // Скролл вверх при активации
  useEffect(() => {
    if (isActive && editMode) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isActive, editMode]);

  // ===================== СОЗДАНИЕ НОВОЙ ЗАМЕТКИ =====================
  
  const handleAddNote = useCallback(() => {
    if (!userdata?.user) return;
    
    setNewItemLoading(true);
    
    setTimeout(() => {
      const newNote = {
        command: 'create',
        id: `new_${dayjs().unix()}${dayjs().millisecond()}`,
        id_orgs: orgId,
        id8staff_list: userdata.user.id,
        theme: '',
        date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        notes: '',
        deleted: 0,
        creator: {
          id: userdata.user.id,
          surname: userdata.user.surname,
          name: userdata.user.name,
          secondname: userdata.user.secondname,
        },
      };
      
      const currentNewNotes = form.getFieldValue('newNotes') || [];
      form.setFieldsValue({ 
        newNotes: [newNote, ...currentNewNotes] 
      });
      
      // Разворачиваем новую заметку
      setExpandedKeys(prev => [...prev, newNote.id]);
      onDataChange?.('n', true);
      setNewItemLoading(false);
    }, 300);
  }, [orgId, userdata, form, onDataChange]);

  // ===================== УДАЛЕНИЕ ЗАМЕТКИ =====================
  
  const handleDeleteNewNote = useCallback((noteId, removeFunc) => {
    removeFunc();
    const remainingNew = (form.getFieldValue('newNotes') || []).filter(n => n?.id !== noteId);
    onDataChange?.('n', remainingNew.length > 0);
  }, [form, onDataChange]);

  // ===================== ПРОВЕРКА ПРАВ =====================
  
  const canEditNote = useCallback((note) => {
    if (!userdata?.user?.id) return false;
    return userdata.user.id === note?.id8staff_list || 
           userdata.user.id === note?.creator?.id;
  }, [userdata]);

  // ===================== ХЕЛПЕРЫ =====================
  
  const getAuthorFullName = (creator) => {
    if (!creator) return '';
    return `${creator.surname || ''} ${creator.name || ''} ${creator.secondname || ''}`.trim();
  };

  const getAuthorShortName = (creator) => {
    if (!creator) return '';
    const surname = creator.surname || '';
    const nameInitial = creator.name ? creator.name[0] + '.' : '';
    const secondInitial = creator.secondname ? creator.secondname[0] + '.' : '';
    return `${surname} ${nameInitial}${secondInitial}`.trim();
  };

  const formatNoteDate = (date) => {
    if (!date) return '';
    const d = dayjs(date);
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${months[d.month()]} ${d.format('YYYY')}`;
  };

  const toggleExpanded = (noteId) => {
    setExpandedKeys(prev => 
      prev.includes(noteId) 
        ? prev.filter(k => k !== noteId)
        : [...prev, noteId]
    );
  };

  // const handleFieldChange = useCallback(() => {
  //   console.log(collectNotesForSave(form, originalData));
  //   onDataChange?.('n', true);
  // }, [onDataChange]);




  const handleFieldChange = useCallback(
    debounce(() => {
      const nfs = collectNotesForSave(form, originalData);
      console.log(nfs);
      onDataChange?.('n', true, {orig: originalData, chan: nfs});
    }, 500), // Здесь указывается время в миллисекундах (500мс = 1/2 секунды)
    [onDataChange],
  );

  // ===================== РЕНДЕР =====================
  
  if (!isActive) {
    return <div className="sat-tab-hidden" />;
  }

  return (
    <div className="sat-tab-container">
      <Spin spinning={loading}>
        {/* Toolbar */}
        <div className="sat-tab-toolbar">
          <Pagination
            disabled={editMode}
            size="small"
            current={currentPage}
            pageSize={pageSize}
            pageSizeOptions={[50, 100]}
            locale={ANTD_PAGINATION_LOCALE}
            showQuickJumper
            total={total}
            onChange={(page, size) => {
              if (page !== currentPage) setCurrentPage(page);
              if (size !== pageSize) setPageSize(size);
            }}
          />
          
          {editMode && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNote}
              disabled={newItemLoading || (form.getFieldValue('newNotes')?.length || 0) > 7}
              loading={newItemLoading}
            >
              Создать заметку
            </Button>
          )}
        </div>

        {/* Контент */}
        <div className="sat-tab-content">
          <Form 
            form={form} 
            layout="vertical"
            onValuesChange={handleFieldChange}
          >
            {/* Новые заметки */}
            <Form.Item noStyle shouldUpdate>
              {() => {
                const newNotes = form.getFieldValue('newNotes') || [];
                if (newNotes.length === 0) return null;
                
                return (
                  <Spin spinning={newItemLoading}>
                    <div className="sat-stack-new">
                      <div className="sat-stack-new-header">Новые заметки</div>
                      
                      <Form.List name="newNotes">
                        {(fields, { remove }) => (
                          <>
                            {fields.map(({ key, name }) => {
                              const note = form.getFieldValue(['newNotes', name]);
                              const isExpanded = expandedKeys.includes(note?.id);
                              
                              return (
                                <NoteCard
                                  key={key}
                                  fieldName={name}
                                  prefix="newNotes"
                                  note={note}
                                  isExpanded={isExpanded}
                                  canEdit={true}
                                  canDelete={true}
                                  onToggle={() => toggleExpanded(note?.id)}
                                  onDelete={() => handleDeleteNewNote(note?.id, () => remove(name))}
                                  getAuthorFullName={getAuthorFullName}
                                  getAuthorShortName={getAuthorShortName}
                                  formatNoteDate={formatNoteDate}
                                />
                              );
                            })}
                          </>
                        )}
                      </Form.List>
                    </div>
                  </Spin>
                );
              }}
            </Form.Item>

            {/* Существующие заметки */}
            <Form.Item noStyle shouldUpdate>
              {() => {
                const existingNotes = form.getFieldValue('existingNotes') || [];
                const newNotes = form.getFieldValue('newNotes') || [];
                
                if (existingNotes.length === 0 && newNotes.length === 0) {
                  return <Empty description="Нет заметок" />;
                }
                
                if (existingNotes.length === 0) return null;
                
                return (
                  <div className="sat-stack-existing">
                    <Form.List name="existingNotes">
                      {(fields) => (
                        <>
                          {fields.map(({ key, name }) => {
                            const note = form.getFieldValue(['existingNotes', name]);
                            const isExpanded = expandedKeys.includes(note?.id);
                            const canEdit = editMode && canEditNote(note);
                            const isDeleted = note?.deleted === 1;
                            
                            return (
                              <NoteCard
                                key={key}
                                fieldName={name}
                                prefix="existingNotes"
                                note={note}
                                isExpanded={isExpanded}
                                isDeleted={isDeleted}
                                canEdit={canEdit}
                                canDelete={false}
                                onToggle={() => toggleExpanded(note?.id)}
                                getAuthorFullName={getAuthorFullName}
                                getAuthorShortName={getAuthorShortName}
                                formatNoteDate={formatNoteDate}
                              />
                            );
                          })}
                        </>
                      )}
                    </Form.List>
                  </div>
                );
              }}
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </div>
  );
};


// =============================================================================
// КОМПОНЕНТ КАРТОЧКИ ЗАМЕТКИ
// =============================================================================

const NoteCard = ({
  fieldName,
  note,
  isExpanded,
  isDeleted,
  canEdit,
  canDelete,
  onToggle,
  onDelete,
  getAuthorFullName,
  getAuthorShortName,
  formatNoteDate,
}) => {
  const theme = note?.theme || '';
  const date = note?.date ? dayjs(note.date) : null;
  
  // Определяем классы
  const itemClasses = [
    'sat-collapse-item',
    isExpanded ? 'sat-expanded' : 'sat-collapsed',
    isDeleted ? 'sat-deleted' : '',
    !canEdit ? 'sat-readonly' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClasses}>
      {/* Header */}
      <div className="sat-collapse-header" onClick={onToggle}>
        <div className="sat-collapse-header-left">
          {/* Trigger */}
          <span className={`sat-trigger-btn ${isExpanded ? 'sat-expanded' : ''}`}>
            <ChevronRightIcon height={CHEVRON_SIZE} />
          </span>
          
          {/* Text */}
          <div className="sat-header-text">
            <span className="sat-header-title">
              {theme || 'Без темы'}
            </span>
            {date && (
              <span className="sat-header-date">
                — {formatNoteDate(date)}
              </span>
            )}
            {note?.creator && (
              <span className="sat-header-author">
                — {getAuthorShortName(note.creator)}
              </span>
            )}
            {note?.id && (
              <span className="sat-header-id">
                ({note.id})
              </span>
            )}
          </div>
        </div>
        
        <div className="sat-collapse-header-right">
          {canDelete && (
            <span 
              className="sat-delete-btn" 
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            >
              <Button
                danger
                size="small"
                icon={<TrashIcon height={CHEVRON_SIZE} />}
              />
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="sat-collapse-body">
        <div className="sat-collapse-content">
          
          {/* Тема */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div className={!theme && canEdit ? 'sat-required' : ''}>
                  <div className="sat-legend">Тема</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item
                        name={[fieldName, 'theme']}
                        noStyle
                      >
                        <Input
                          placeholder={canEdit ? 'Введите тему' : ''}
                          maxLength={200}
                          readOnly={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Автор и Дата */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-2-col">
                <div>
                  <div className="sat-legend">Автор</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Input
                        value={getAuthorFullName(note?.creator)}
                        readOnly
                        disabled
                        variant="borderless"
                        className={'sat-notedit'}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sat-legend">Дата</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <DatePicker
                        value={date}
                        disabled
                        variant="borderless"
                        style={{ width: '100%' }}
                        className={'sat-notedit'}
                        format="DD.MM.YYYY"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Текст заметки */}
          <div className="sat-section">
            <div className="sat-row-wrapper">
              <div className="sat-row sat-1-col">
                <div className={!note?.notes && canEdit ? 'sat-required' : ''}>
                  <div className="sat-legend">Заметка</div>
                  <div className="sat-content">
                    <div className="sat-content-inner">
                      <Form.Item
                        name={[fieldName, 'notes']}
                        noStyle
                      >
                        <TextArea
                          placeholder={canEdit ? 'Текст заметки...' : ''}
                          maxLength={5000}
                          readOnly={!canEdit}
                          variant={canEdit ? 'underlined' : 'borderless'}
                          autoSize={{ minRows: TEXTAREA_MIN_ROWS, maxRows: TEXTAREA_MAX_ROWS }}
                          className={canEdit ? 'sat-canedit' : 'sat-notedit'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


// =============================================================================
// УТИЛИТА ДЛЯ СБОРА ДАННЫХ ПЕРЕД СОХРАНЕНИЕМ
// =============================================================================

export const collectNotesForSave = (form, originalData = []) => {
  const values = form.getFieldsValue();
  const result = [];
  
  // Новые заметки
  const newNotes = values.newNotes || [];
  newNotes.forEach(note => {
    if (note && !note.deleted) {
      result.push({
        ...note,
        command: 'create',
        date: note.date ? dayjs(note.date).format('DD.MM.YYYY HH:mm:ss') : null,
      });
    }
  });
  
  // Существующие заметки - только изменённые
  const existingNotes = values.existingNotes || [];
  existingNotes.forEach((note) => {
    if (!note) return;
    
    const original = originalData.find(o => o.id === note.id);
    if (!original) return;
    
    const isChanged = 
      note.theme !== original.theme ||
      note.notes !== original.notes ||
      note.deleted !== original.deleted;
    
    if (isChanged) {
      result.push({
        ...note,
        command: note.deleted ? 'delete' : 'update',
        date: note.date ? dayjs(note.date).format('DD.MM.YYYY HH:mm:ss') : null,
      });
    }
  });
  
  return result;
};


export default NotesTabForm;
