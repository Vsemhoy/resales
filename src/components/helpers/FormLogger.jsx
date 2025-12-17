/**
 * FormLogger.js - Сервис логирования действий пользователя в IndexedDB
 * v2.1 - Исправлена фильтрация по типам
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
    this.user_role = null;
    this.userName = null;
    this._dbReady = this._initDB();
    
    this.com_id = null;
    this.com_curator = null;
    this.com_editor = null;
    this.com_state = null;
    this.com_idcom = null;
    this.com_name = null;
    
    // Запускаем очистку при старте
    this._dbReady.then(() => this._cleanupOldLogs());
  }

  // ===================== ИНИЦИАЛИЗАЦИЯ =====================

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
        
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        
        const store = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: false 
        });
        
        store.createIndex('timestampMs', 'timestampMs', { unique: false });
        store.createIndex('orgId', 'meta.orgId', { unique: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        
        console.log('[FormLogger] БД создана/обновлена');
      };
    });
  }

  async _ensureDB() {
    await this._dbReady;
    if (!this.db) {
      this._dbReady = this._initDB();
      await this._dbReady;
    }
    return this.db;
  }

  // ===================== КОНФИГУРАЦИЯ =====================

  setMaxAgeDays(days) {
    this.maxAgeDays = days;
    this._cleanupOldLogs();
  }

  setUser(userId, userName, role) {
    this.userId = userId;
    this.userName = userName;
    this.user_role = role;
  }

  setComCurator(curator_id) { this.com_curator = curator_id; }
  setComEditor(editor_id) { this.com_editor = editor_id; }
  setComState(state_code) { this.com_state = state_code; }
  setComId(com_id) { this.com_id = com_id; }
  setComIdCompany(com_id) { this.com_idcom = com_id; }
  setComName(com) { this.com_name = com; }

  // ===================== ЛОГИРОВАНИЕ =====================

  async log(action, data, meta = {}) {
    try {
      const db = await this._ensureDB();
      const now = new Date();
      
      const logEntry = {
        id: this._generateId(),
        timestamp: now.toISOString(),
        timestampMs: now.getTime(),
        date: now.toISOString().slice(0, 10),
        sessionId: this.sessionId,
        userId: this.userId,
        userName: this.userName,
        userRole: this.user_role,
        comState: {
          id: this.com_id,
          editor_id: this.com_editor,
          state: this.com_state,
          curator_id: this.com_curator,
          id_company: this.com_idcom,
          name: this.com_name
        },
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
        
        request.onsuccess = () => resolve(logEntry.id);
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

  async logFormState(action, formValues, meta = {}) {
    const compactData = this._compactFormData(formValues);
    return this.log(action, compactData, { ...meta, isFormSnapshot: true });
  }

  async logFullFormState(action, formValues, meta = {}) {
    return this.log(action, formValues, { ...meta, isFullSnapshot: true });
  }

  async logBeforeSave(payload, meta = {}) {
    return this.log('BEFORE_SAVE', payload, { ...meta, isSaveAttempt: true });
  }

  async logSaveSuccess(response, meta = {}) {
    return this.log('SAVE_SUCCESS', {
      status: response?.status,
      data: response?.data,
    }, meta);
  }

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
   * Применение фильтров к массиву логов
   * ИСПРАВЛЕНО: правильная обработка массива action
   */
  _applyFilters(logs, { name, comState, action, date, fromDate, toDate }) {
    return logs.filter(log => {
      // Фильтр по названию компании
      if (name) {
        const logName = log.data?.main?.name || log.comState?.name || '';
        if (!logName.toLowerCase().includes(name.toLowerCase())) {
          return false;
        }
      }

      // Фильтр по comState
      if (comState && Object.keys(comState).length > 0) {
        for (const [key, value] of Object.entries(comState)) {
          if (value === undefined || value === null || value === '') continue;
          if (String(log.comState?.[key]) !== String(value)) {
            return false;
          }
        }
      }

      // Фильтр по action (массив или строка)
      if (action) {
        if (Array.isArray(action) && action.length > 0) {
          if (!action.includes(log.action)) {
            return false;
          }
        } else if (typeof action === 'string' && action !== '') {
          if (log.action !== action) {
            return false;
          }
        }
      }

      // Фильтр по конкретной дате
      if (date && log.date !== date) {
        return false;
      }

      // Фильтр по диапазону дат
      if (fromDate) {
        const from = new Date(fromDate).getTime();
        if (log.timestampMs < from) return false;
      }
      if (toDate) {
        const to = new Date(toDate).getTime() + 24 * 60 * 60 * 1000;
        if (log.timestampMs > to) return false;
      }

      return true;
    });
  }

  /**
   * Получить количество логов с фильтрами
   */
  async getLogsCount(filters = {}) {
    const allLogs = await this._getAllLogsFromIDB();
    return this._applyFilters(allLogs, filters).length;
  }

  /**
   * Получить логи с фильтрацией и пагинацией
   */
  async getLogs({
    name = null,
    comState = null,
    date = null,
    action = null,
    fromDate = null,
    toDate = null,
    page = 1,
    limit = 0
  } = {}) {
    try {
      const allLogs = await this._getAllLogsFromIDB();
      let filtered = this._applyFilters(allLogs, { name, comState, action, date, fromDate, toDate });

      // Сортировка от новых к старым
      filtered.sort((a, b) => b.timestampMs - a.timestampMs);

      // Пагинация
      if (limit > 0) {
        const start = (page - 1) * limit;
        filtered = filtered.slice(start, start + limit);
      }

      return filtered;
    } catch (e) {
      console.error('[FormLogger] Ошибка фильтрации логов:', e);
      return [];
    }
  }

  async _getAllLogsFromIDB() {
    const db = await this._ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получить статистику по дням для heatmap
   * @param {number} days - Количество дней назад
   * @returns {Promise<Object>} - { 'YYYY-MM-DD': count }
   */
  async getHeatmapData(days = 90) {
    const allLogs = await this._getAllLogsFromIDB();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    
    const heatmap = {};
    
    allLogs.forEach(log => {
      if (log.timestampMs >= cutoff && log.date) {
        heatmap[log.date] = (heatmap[log.date] || 0) + 1;
      }
    });
    
    return heatmap;
  }

  /**
   * Получить статистику по типам действий для выбранной даты
   */
  async getDateStats(date) {
    const logs = await this.getLogs({ date });
    const byAction = {};
    
    logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    });
    
    return {
      total: logs.length,
      byAction,
    };
  }

  async getLogsByOrg(orgId) {
    try {
      const db = await this._ensureDB();
      const numOrgId = parseInt(orgId);
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('orgId');
        
        const results = [];
        let completed = 0;
        
        const processResults = () => {
          completed++;
          if (completed === 2) {
            const unique = [...new Map(results.map(r => [r.id, r])).values()];
            unique.sort((a, b) => b.timestampMs - a.timestampMs);
            resolve(unique);
          }
        };
        
        const req1 = index.getAll(IDBKeyRange.only(numOrgId));
        req1.onsuccess = () => { results.push(...req1.result); processResults(); };
        req1.onerror = () => processResults();
        
        const req2 = index.getAll(IDBKeyRange.only(String(orgId)));
        req2.onsuccess = () => { results.push(...req2.result); processResults(); };
        req2.onerror = () => processResults();
      });
    } catch (e) {
      console.error('[FormLogger] Ошибка поиска по orgId:', e);
      return [];
    }
  }

  async getSessionLogs() {
    try {
      const db = await this._ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('sessionId');
        const request = index.getAll(IDBKeyRange.only(this.sessionId));
        
        request.onsuccess = () => {
          const logs = request.result.sort((a, b) => b.timestampMs - a.timestampMs);
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  }

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
          const logs = request.result.sort((a, b) => b.timestampMs - a.timestampMs);
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  }

  async getStats() {
    const logs = await this._getAllLogsFromIDB();
    const byAction = {};
    const byOrg = {};
    const byDate = {};
    const byUser = {};
    
    logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      
      if (log.comState?.id) {
        const key = `${log.comState.id}`;
        byOrg[key] = (byOrg[key] || 0) + 1;
      }
      
      if (log.date) {
        byDate[log.date] = (byDate[log.date] || 0) + 1;
      }
      
      if (log.userId) {
        byUser[log.userId] = (byUser[log.userId] || 0) + 1;
      }
    });

    const dbSize = await this._getDBSize();

    return {
      totalLogs: logs.length,
      dbSize,
      byAction,
      byOrg,
      byDate,
      byUser,
      oldestLog: logs.length > 0 ? logs.reduce((a, b) => a.timestampMs < b.timestampMs ? a : b).timestamp : null,
      newestLog: logs.length > 0 ? logs.reduce((a, b) => a.timestampMs > b.timestampMs ? a : b).timestamp : null,
      currentSession: this.sessionId,
      maxAgeDays: this.maxAgeDays,
    };
  }

  // ===================== ЭКСПОРТ =====================

  async exportToFile(filename = null, filter = {}) {
    const logs = await this.getLogs(filter);

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
    
    if (!filename) {
      const dateStr = new Date().toISOString().slice(0, 10);
      filename = `form_logs_${dateStr}.json`;
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`[FormLogger] Экспортировано ${logs.length} логов в ${filename}`);
    return exportData;
  }

  async exportToString(filter = {}) {
    const logs = await this.getLogs(filter);
    return JSON.stringify(logs, null, 2);
  }

  async copyToClipboard(filter = {}) {
    const str = await this.exportToString(filter);
    await navigator.clipboard.writeText(str);
    console.log('[FormLogger] Логи скопированы в буфер обмена');
  }

  // ===================== ОЧИСТКА =====================

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

  async clearByOrg(orgId) {
    try {
      const logs = await this.getLogsByOrg(orgId);
      const db = await this._ensureDB();
      
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
    } catch (e) {}
    return null;
  }
}

// =============================================================================
// СИНГЛТОН
// =============================================================================

export const formLogger = new FormLoggerService();

if (typeof window !== 'undefined') {
  window.formLogger = formLogger;
}

export default formLogger;


// =============================================================================
// ТИПЫ ДЕЙСТВИЙ
// =============================================================================

export const LOG_ACTIONS = {
  PAGE_OPEN: 'PAGE_OPEN',
  PAGE_CLOSE: 'PAGE_CLOSE',
  TAB_CHANGE: 'TAB_CHANGE',
  EDIT_MODE_ENTER: 'EDIT_MODE_ENTER',
  EDIT_MODE_EXIT: 'EDIT_MODE_EXIT',
  FIELD_CHANGE: 'FIELD_CHANGE',
  FIELD_BLUR: 'FIELD_BLUR',
  ITEM_ADD: 'ITEM_ADD',
  ITEM_DELETE: 'ITEM_DELETE',
  ITEM_UPDATE: 'ITEM_UPDATE',
  BEFORE_SAVE: 'BEFORE_SAVE',
  SAVE_SUCCESS: 'SAVE_SUCCESS',
  SAVE_ERROR: 'SAVE_ERROR',
  FORM_SNAPSHOT: 'FORM_SNAPSHOT',
  AUTO_SNAPSHOT: 'AUTO_SNAPSHOT',
  EMERGENCY_SNAPSHOT: 'EMERGENCY_SNAPSHOT',
  FORM_RESET: 'FORM_RESET',
  ERROR: 'ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CURATOR_REQUEST: 'CURATOR_REQUEST',
  CURATOR_REQUEST_RESULT: 'CURATOR_REQUEST_RESULT',
  CURATOR_REQUEST_FAILED: 'CURATOR_REQUEST_FAILED',
};


// =============================================================================
// КОНФИГУРАЦИЯ ТИПОВ ДЛЯ UI
// =============================================================================

export const LOG_TYPE_CONFIG = {
  PAGE_OPEN: { label: 'Открытие страницы', color: '#52c41a', icon: '📂' },
  PAGE_CLOSE: { label: 'Закрытие страницы', color: '#8c8c8c', icon: '📁' },
  TAB_CHANGE: { label: 'Смена вкладки', color: '#1890ff', icon: '📑' },
  EDIT_MODE_ENTER: { label: 'Начало редактирования', color: '#faad14', icon: '✏️' },
  EDIT_MODE_EXIT: { label: 'Конец редактирования', color: '#d9d9d9', icon: '✅' },
  FIELD_CHANGE: { label: 'Изменение поля', color: '#91d5ff', icon: '📝' },
  FORM_SNAPSHOT: { label: 'Снимок формы', color: '#b37feb', icon: '📸' },
  AUTO_SNAPSHOT: { label: 'Автоснимок', color: '#d3adf7', icon: '⏱️' },
  EMERGENCY_SNAPSHOT: { label: 'Экстренный снимок', color: '#ff7875', icon: '🆘' },
  BEFORE_SAVE: { label: 'Перед сохранением', color: '#ffc53d', icon: '💾' },
  SAVE_SUCCESS: { label: 'Сохранено успешно', color: '#73d13d', icon: '✅' },
  SAVE_ERROR: { label: 'Ошибка сохранения', color: '#ff4d4f', icon: '❌' },
  ERROR: { label: 'Ошибка', color: '#ff4d4f', icon: '⚠️' },
  ITEM_ADD: { label: 'Добавление элемента', color: '#95de64', icon: '➕' },
  ITEM_DELETE: { label: 'Удаление элемента', color: '#ff7875', icon: '➖' },
  ITEM_UPDATE: { label: 'Обновление элемента', color: '#69c0ff', icon: '🔄' },
  CURATOR_REQUEST: { label: 'Запрос кураторства', color: '#597ef7', icon: '👤' },
  CURATOR_REQUEST_RESULT: { label: 'Результат кураторства', color: '#85a5ff', icon: '👥' },
  CURATOR_REQUEST_FAILED: { label: 'Ошибка кураторства', color: '#ff7875', icon: '👤❌' },
};


// =============================================================================
// REACT ХУКИ
// =============================================================================

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
