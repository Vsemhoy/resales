/**
 * FormLogger.js - Сервис логирования действий пользователя в IndexedDB
 * 
 * ВОЗМОЖНОСТИ:
 * - Хранение логов до 90 дней (настраивается)
 * - Автоочистка старых записей
 * - Поиск по orgId, сессии, времени
 * - Экспорт в JSON файл
 * - Сжатие больших данных
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * 
 * import { formLogger, LOG_ACTIONS } from './FormLogger';
 * 
 * // Логирование
 * formLogger.log('CONTACT_UPDATE', { id: 123, name: 'Иванов' }, { orgId: 456 });
 * 
 * // Снимок формы перед сохранением
 * formLogger.logBeforeSave(payload, { orgId: 456 });
 * 
 * // Экспорт
 * formLogger.exportToFile();
 * formLogger.exportToFile('logs_org_456.json', { orgId: 456 });
 * 
 * // В консоли браузера
 * formLogger.getLogs()
 * formLogger.getLogsByOrg(13675)
 * formLogger.getStats()
 */

const DB_NAME = 'torg_form_logs_db';
const DB_VERSION = 2;
const STORE_NAME = 'logs';
const DEFAULT_MAX_AGE_DAYS = 90;

class FormLoggerService {
  constructor() {
    this.db = null;
    this.maxAgeDays = DEFAULT_MAX_AGE_DAYS;
    this.sessionId = this._generateSessionId();
    this.userId = null;
    this.userName = null;
    this._dbReady = this._initDB();
    
    // Запускаем очистку при старте
    this._dbReady.then(() => this._cleanupOldLogs());
  }

  // ===================== ИНИЦИАЛИЗАЦИЯ =====================

  /**
   * Инициализация базы данных
   */
  async _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[FormLogger] Ошибка открытия БД:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[FormLogger] БД инициализирована');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Удаляем старое хранилище если есть (для миграции)
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        
        // Создаём хранилище с индексами
        const store = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: false 
        });
        
        // Индексы для быстрого поиска
        store.createIndex('timestampMs', 'timestampMs', { unique: false });
        store.createIndex('orgId', 'meta.orgId', { unique: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('date', 'date', { unique: false }); // YYYY-MM-DD для группировки
        
        console.log('[FormLogger] БД создана/обновлена');
      };
    });
  }

  /**
   * Ожидание готовности БД
   */
  async _ensureDB() {
    await this._dbReady;
    if (!this.db) {
      this._dbReady = this._initDB();
      await this._dbReady;
    }
    return this.db;
  }

  // ===================== КОНФИГУРАЦИЯ =====================

  /**
   * Установить максимальный возраст логов в днях
   * @param {number} days - Количество дней (по умолчанию 90)
   */
  setMaxAgeDays(days) {
    this.maxAgeDays = days;
    this._cleanupOldLogs();
  }

  /**
   * Установить данные текущего пользователя
   * @param {number} userId 
   * @param {string} userName 
   */
  setUser(userId, userName) {
    this.userId = userId;
    this.userName = userName;
  }

  // ===================== ЛОГИРОВАНИЕ =====================

  /**
   * Записать лог
   * @param {string} action - Тип действия (см. LOG_ACTIONS)
   * @param {any} data - Данные для логирования
   * @param {Object} meta - Метаданные { orgId, orgName, ... }
   * @returns {Promise<string|null>} - ID записи или null при ошибке
   */
  async log(action, data, meta = {}) {
    try {
      const db = await this._ensureDB();
      const now = new Date();
      
      const logEntry = {
        id: this._generateId(),
        timestamp: now.toISOString(),
        timestampMs: now.getTime(),
        date: now.toISOString().slice(0, 10), // YYYY-MM-DD
        sessionId: this.sessionId,
        userId: this.userId,
        userName: this.userName,
        action,
        data: this._sanitizeData(data),
        meta: {
          ...meta,
          url: window.location.href,
          pathname: window.location.pathname,
        },
      };

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.add(logEntry);
        
        request.onsuccess = () => {
          // console.log(`[FormLogger] ${action}`, logEntry.id);
          resolve(logEntry.id);
        };
        request.onerror = () => {
          console.error('[FormLogger] Ошибка записи:', request.error);
          reject(request.error);
        };
      });
    } catch (e) {
      console.error('[FormLogger] Ошибка записи лога:', e);
      return null;
    }
  }

  /**
   * Логирование снимка формы (фильтрует только изменённые данные)
   * @param {string} action - Тип действия
   * @param {Object} formValues - Значения формы
   * @param {Object} meta - Метаданные
   */
  async logFormState(action, formValues, meta = {}) {
    const compactData = this._compactFormData(formValues);
    return this.log(action, compactData, { ...meta, isFormSnapshot: true });
  }

  /**
   * Логирование ПОЛНОГО снимка формы (без фильтрации)
   * Используй для критических моментов (перед сохранением, при ошибках)
   */
  async logFullFormState(action, formValues, meta = {}) {
    return this.log(action, formValues, { ...meta, isFullSnapshot: true });
  }

  /**
   * Логирование перед отправкой на сервер
   * @param {Object} payload - Данные, отправляемые на сервер
   * @param {Object} meta - Метаданные
   */
  async logBeforeSave(payload, meta = {}) {
    return this.log('BEFORE_SAVE', payload, { ...meta, isSaveAttempt: true });
  }

  /**
   * Логирование успешного сохранения
   */
  async logSaveSuccess(response, meta = {}) {
    return this.log('SAVE_SUCCESS', {
      status: response?.status,
      data: response?.data,
    }, meta);
  }

  /**
   * Логирование ошибки
   * @param {string} errorType - Тип ошибки
   * @param {Error|string} error - Ошибка
   * @param {Object} context - Контекст (payload, orgId и т.д.)
   */
  async logError(errorType, error, context = {}) {
    return this.log('ERROR', {
      errorType,
      message: error?.message || String(error),
      stack: error?.stack,
      responseStatus: error?.response?.status,
      responseData: error?.response?.data,
      context,
    }, { isError: true, ...context });
  }

  // ===================== ПОЛУЧЕНИЕ ЛОГОВ =====================

  /**
   * Получить все логи (отсортированные по времени)
   * @param {number} limit - Максимальное количество (0 = все)
   * @returns {Promise<Array>}
   */
  async getLogs(limit = 0) {
    try {
      const db = await this._ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('timestampMs');
        const request = index.openCursor(null, 'prev'); // От новых к старым
        
        const logs = [];
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor && (limit === 0 || logs.length < limit)) {
            logs.push(cursor.value);
            cursor.continue();
          } else {
            resolve(logs.reverse()); // Возвращаем в хронологическом порядке
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('[FormLogger] Ошибка чтения логов:', e);
      return [];
    }
  }

  /**
   * Получить логи по orgId
   * @param {number|string} orgId 
   * @returns {Promise<Array>}
   */
  async getLogsByOrg(orgId) {
    try {
      const db = await this._ensureDB();
      const numOrgId = parseInt(orgId);
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('orgId');
        
        // Пробуем оба варианта (число и строка)
        const results = [];
        let completed = 0;
        
        const processResults = () => {
          completed++;
          if (completed === 2) {
            // Убираем дубликаты и сортируем
            const unique = [...new Map(results.map(r => [r.id, r])).values()];
            unique.sort((a, b) => a.timestampMs - b.timestampMs);
            resolve(unique);
          }
        };
        
        // Поиск по числу
        const req1 = index.getAll(IDBKeyRange.only(numOrgId));
        req1.onsuccess = () => { results.push(...req1.result); processResults(); };
        req1.onerror = () => processResults();
        
        // Поиск по строке
        const req2 = index.getAll(IDBKeyRange.only(String(orgId)));
        req2.onsuccess = () => { results.push(...req2.result); processResults(); };
        req2.onerror = () => processResults();
      });
    } catch (e) {
      console.error('[FormLogger] Ошибка поиска по orgId:', e);
      return [];
    }
  }

  /**
   * Получить логи текущей сессии
   * @returns {Promise<Array>}
   */
  async getSessionLogs() {
    try {
      const db = await this._ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('sessionId');
        const request = index.getAll(IDBKeyRange.only(this.sessionId));
        
        request.onsuccess = () => {
          const logs = request.result.sort((a, b) => a.timestampMs - b.timestampMs);
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  }

  /**
   * Получить логи за последние N минут
   * @param {number} minutes 
   * @returns {Promise<Array>}
   */
  async getRecentLogs(minutes = 60) {
    try {
      const db = await this._ensureDB();
      const cutoff = Date.now() - minutes * 60 * 1000;
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('timestampMs');
        const range = IDBKeyRange.lowerBound(cutoff);
        const request = index.getAll(range);
        
        request.onsuccess = () => {
          const logs = request.result.sort((a, b) => a.timestampMs - b.timestampMs);
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  }

  /**
   * Получить логи за определённую дату
   * @param {string} date - Дата в формате YYYY-MM-DD
   * @returns {Promise<Array>}
   */
  async getLogsByDate(date) {
    try {
      const db = await this._ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('date');
        const request = index.getAll(IDBKeyRange.only(date));
        
        request.onsuccess = () => {
          const logs = request.result.sort((a, b) => a.timestampMs - b.timestampMs);
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  }

  /**
   * Получить логи за период
   * @param {Date|string} fromDate 
   * @param {Date|string} toDate 
   * @returns {Promise<Array>}
   */
  async getLogsByDateRange(fromDate, toDate) {
    try {
      const db = await this._ensureDB();
      const from = new Date(fromDate).getTime();
      const to = new Date(toDate).getTime() + 24 * 60 * 60 * 1000; // До конца дня
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('timestampMs');
        const range = IDBKeyRange.bound(from, to);
        const request = index.getAll(range);
        
        request.onsuccess = () => {
          const logs = request.result.sort((a, b) => a.timestampMs - b.timestampMs);
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  }

  /**
   * Поиск логов с фильтрами
   * @param {Object} filters - { orgId, action, fromDate, toDate, sessionId }
   * @returns {Promise<Array>}
   */
  async searchLogs(filters = {}) {
    let logs = await this.getLogs();
    
    if (filters.orgId) {
      const orgId = parseInt(filters.orgId);
      logs = logs.filter(l => 
        l.meta?.orgId === orgId || l.meta?.orgId === String(filters.orgId)
      );
    }
    
    if (filters.action) {
      logs = logs.filter(l => l.action === filters.action);
    }
    
    if (filters.actions && filters.actions.length > 0) {
      logs = logs.filter(l => filters.actions.includes(l.action));
    }
    
    if (filters.fromDate) {
      const from = new Date(filters.fromDate).getTime();
      logs = logs.filter(l => l.timestampMs >= from);
    }
    
    if (filters.toDate) {
      const to = new Date(filters.toDate).getTime() + 24 * 60 * 60 * 1000;
      logs = logs.filter(l => l.timestampMs <= to);
    }
    
    if (filters.sessionId) {
      logs = logs.filter(l => l.sessionId === filters.sessionId);
    }
    
    if (filters.userId) {
      logs = logs.filter(l => l.userId === filters.userId);
    }
    
    return logs;
  }

  /**
   * Получить статистику логов
   * @returns {Promise<Object>}
   */
  async getStats() {
    const logs = await this.getLogs();
    const byAction = {};
    const byOrg = {};
    const byDate = {};
    const byUser = {};
    
    logs.forEach(log => {
      // По действиям
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      
      // По организациям
      if (log.meta?.orgId) {
        const key = `${log.meta.orgId}`;
        byOrg[key] = (byOrg[key] || 0) + 1;
      }
      
      // По датам
      if (log.date) {
        byDate[log.date] = (byDate[log.date] || 0) + 1;
      }
      
      // По пользователям
      if (log.userId) {
        byUser[log.userId] = (byUser[log.userId] || 0) + 1;
      }
    });

    // Размер БД
    const dbSize = await this._getDBSize();

    return {
      totalLogs: logs.length,
      dbSize,
      byAction,
      byOrg,
      byDate,
      byUser,
      oldestLog: logs[0]?.timestamp,
      newestLog: logs[logs.length - 1]?.timestamp,
      currentSession: this.sessionId,
      maxAgeDays: this.maxAgeDays,
    };
  }

  // ===================== ЭКСПОРТ =====================

  /**
   * Экспорт логов в JSON файл
   * @param {string} filename - Имя файла (опционально)
   * @param {Object} filter - Фильтр { orgId, fromDate, toDate, actions }
   * @returns {Promise<Object>} - Экспортированные данные
   */
  async exportToFile(filename = null, filter = {}) {
    const logs = await this.searchLogs(filter);

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: {
        sessionId: this.sessionId,
        userId: this.userId,
        userName: this.userName,
      },
      filter,
      totalLogs: logs.length,
      logs,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Генерируем имя файла
    if (!filename) {
      const dateStr = new Date().toISOString().slice(0, 10);
      const orgSuffix = filter.orgId ? `_org${filter.orgId}` : '';
      filename = `form_logs${orgSuffix}_${dateStr}.json`;
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`[FormLogger] Экспортировано ${logs.length} логов в ${filename}`);
    return exportData;
  }

  /**
   * Получить логи как строку JSON
   * @param {Object} filter - Фильтр
   * @returns {Promise<string>}
   */
  async exportToString(filter = {}) {
    const logs = await this.searchLogs(filter);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Копировать логи в буфер обмена
   * @param {Object} filter - Фильтр
   */
  async copyToClipboard(filter = {}) {
    const str = await this.exportToString(filter);
    await navigator.clipboard.writeText(str);
    console.log('[FormLogger] Логи скопированы в буфер обмена');
  }

  // ===================== ОЧИСТКА =====================

  /**
   * Очистить все логи
   */
  async clearAll() {
    try {
      const db = await this._ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log('[FormLogger] Все логи очищены');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('[FormLogger] Ошибка очистки:', e);
    }
  }

  /**
   * Очистить логи старше N дней
   * @param {number} days 
   * @returns {Promise<number>} - Количество удалённых записей
   */
  async clearOlderThan(days) {
    try {
      const db = await this._ensureDB();
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('timestampMs');
        const range = IDBKeyRange.upperBound(cutoff);
        
        const request = index.openCursor(range);
        let deletedCount = 0;
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            if (deletedCount > 0) {
              console.log(`[FormLogger] Удалено ${deletedCount} логов старше ${days} дней`);
            }
            resolve(deletedCount);
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('[FormLogger] Ошибка очистки старых логов:', e);
      return 0;
    }
  }

  /**
   * Очистить логи по orgId
   * @param {number|string} orgId 
   */
  async clearByOrg(orgId) {
    try {
      const db = await this._ensureDB();
      const logs = await this.getLogsByOrg(orgId);
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        let deleted = 0;
        logs.forEach(log => {
          store.delete(log.id);
          deleted++;
        });
        
        tx.oncomplete = () => {
          console.log(`[FormLogger] Удалено ${deleted} логов для org ${orgId}`);
          resolve(deleted);
        };
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('[FormLogger] Ошибка очистки по orgId:', e);
    }
  }

  // ===================== ПРИВАТНЫЕ МЕТОДЫ =====================

  async _cleanupOldLogs() {
    await this.clearOlderThan(this.maxAgeDays);
  }

  _sanitizeData(data) {
    try {
      const str = JSON.stringify(data);
      // Лимит 500KB на одну запись
      if (str.length > 500000) {
        return {
          _truncated: true,
          _originalSize: str.length,
          _preview: str.slice(0, 10000),
          _message: 'Данные обрезаны из-за большого размера',
        };
      }
      return JSON.parse(str);
    } catch (e) {
      return { 
        _serializationError: e.message,
        _dataType: typeof data,
      };
    }
  }

  _compactFormData(formValues) {
    if (!formValues || typeof formValues !== 'object') {
      return formValues;
    }
    
    const compact = {};
    
    for (const [key, value] of Object.entries(formValues)) {
      if (Array.isArray(value)) {
        // Для массивов сохраняем только изменённые элементы
        const modifiedItems = value.filter(item => 
          item?._modified === true || 
          item?.command || 
          String(item?.id).startsWith('new_')
        );
        if (modifiedItems.length > 0) {
          compact[key] = modifiedItems;
        }
      } else if (value !== null && value !== undefined && value !== '') {
        compact[key] = value;
      }
    }
    
    return compact;
  }

  _generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateSessionId() {
    let sessionId = sessionStorage.getItem('torg_session_id');
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      sessionStorage.setItem('torg_session_id', sessionId);
    }
    return sessionId;
  }

  async _getDBSize() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          usedMB: (estimate.usage / 1024 / 1024).toFixed(2),
          quota: estimate.quota,
          quotaMB: (estimate.quota / 1024 / 1024).toFixed(2),
          percent: ((estimate.usage / estimate.quota) * 100).toFixed(2),
        };
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }
}

// =============================================================================
// СИНГЛТОН
// =============================================================================

export const formLogger = new FormLoggerService();

// Для консоли браузера
if (typeof window !== 'undefined') {
  window.formLogger = formLogger;
}

export default formLogger;


// =============================================================================
// ТИПЫ ДЕЙСТВИЙ
// =============================================================================

export const LOG_ACTIONS = {
  // Навигация
  PAGE_OPEN: 'PAGE_OPEN',
  PAGE_CLOSE: 'PAGE_CLOSE',
  TAB_CHANGE: 'TAB_CHANGE',
  
  // Режим редактирования
  EDIT_MODE_ENTER: 'EDIT_MODE_ENTER',
  EDIT_MODE_EXIT: 'EDIT_MODE_EXIT',
  
  // Изменения полей
  FIELD_CHANGE: 'FIELD_CHANGE',
  FIELD_BLUR: 'FIELD_BLUR',
  
  // Списки (контакты, телефоны и т.д.)
  ITEM_ADD: 'ITEM_ADD',
  ITEM_DELETE: 'ITEM_DELETE',
  ITEM_UPDATE: 'ITEM_UPDATE',
  
  // Сохранение
  BEFORE_SAVE: 'BEFORE_SAVE',
  SAVE_SUCCESS: 'SAVE_SUCCESS',
  SAVE_ERROR: 'SAVE_ERROR',
  
  // Снимки формы
  FORM_SNAPSHOT: 'FORM_SNAPSHOT',
  AUTO_SNAPSHOT: 'AUTO_SNAPSHOT',
  EMERGENCY_SNAPSHOT: 'EMERGENCY_SNAPSHOT',
  FORM_RESET: 'FORM_RESET',
  
  // Ошибки
  ERROR: 'ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};


// =============================================================================
// REACT ХУКИ
// =============================================================================

/**
 * Хук для логирования в компоненте
 * 
 * const { log, logChange, logSnapshot } = useFormLogger(orgId);
 */
export const useFormLogger = (orgId, orgName = null) => {
  const log = (action, data = {}) => {
    return formLogger.log(action, data, { orgId, orgName });
  };

  const logChange = (fieldName, value, extra = {}) => {
    return formLogger.log(LOG_ACTIONS.FIELD_CHANGE, {
      field: fieldName,
      value,
      ...extra,
    }, { orgId, orgName });
  };

  const logSnapshot = (formValues, action = LOG_ACTIONS.FORM_SNAPSHOT) => {
    return formLogger.logFormState(action, formValues, { orgId, orgName });
  };

  const logFullSnapshot = (formValues, action = LOG_ACTIONS.FORM_SNAPSHOT) => {
    return formLogger.logFullFormState(action, formValues, { orgId, orgName });
  };

  const logBeforeSave = (payload) => {
    return formLogger.logBeforeSave(payload, { orgId, orgName });
  };

  const logError = (errorType, error, context = {}) => {
    return formLogger.logError(errorType, error, { ...context, orgId, orgName });
  };

  return { 
    log, 
    logChange, 
    logSnapshot, 
    logFullSnapshot, 
    logBeforeSave, 
    logError 
  };
};