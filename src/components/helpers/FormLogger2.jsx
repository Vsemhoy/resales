/**
 * FormLogger.js - Оптимизированная версия с лимитами
 * 
 * ЛИМИТЫ:
 * - MAX_RECORDS: 15000 записей (мягкий лимит)
 * - MAX_SIZE_MB: 20 MB (предупреждение)
 * - HARD_LIMIT_RECORDS: 25000 (автоочистка)
 */

const DB_NAME = 'torg_form_logs_db';
const DB_VERSION = 3;
const STORE_NAME = 'logs';

// ===================== ЛИМИТЫ =====================
const CONFIG = {
  DEFAULT_MAX_AGE_DAYS: 90,
  MAX_RECORDS: 20000,           // Мягкий лимит - предупреждение
  HARD_LIMIT_RECORDS: 25000,    // Жёсткий лимит - автоочистка
  MAX_SIZE_MB: 50,              // Предупреждение о размере
  CLEANUP_BATCH_SIZE: 1000,     // Удалять пачками
  QUERY_LIMIT: 5000,            // Макс записей в одном запросе
};

class FormLoggerService {
  constructor() {
    this.db = null;
    this.maxAgeDays = CONFIG.DEFAULT_MAX_AGE_DAYS;
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

    // Кэш для статистики
    this._statsCache = null;
    this._statsCacheTime = 0;
    
    // Запускаем проверку при старте
    this._dbReady.then(() => this._performMaintenance());
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
        
        // Индексы
        store.createIndex('timestampMs', 'timestampMs', { unique: false });
        store.createIndex('orgId', 'meta.orgId', { unique: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('comId', 'comState.id', { unique: false }); // Новый индекс
        
        console.log('[FormLogger] БД создана/обновлена v3');
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

  // ===================== ОБСЛУЖИВАНИЕ БД =====================

  /**
   * Периодическое обслуживание: очистка старых + проверка лимитов
   */
  async _performMaintenance() {
    try {
      // 1. Очистка по возрасту
      await this.clearOlderThan(this.maxAgeDays);
      
      // 2. Проверка количества записей
      const count = await this.getRecordsCount();
      
      if (count > CONFIG.HARD_LIMIT_RECORDS) {
        console.warn(`[FormLogger] Превышен лимит (${count}/${CONFIG.HARD_LIMIT_RECORDS}), очистка...`);
        await this._trimToLimit(CONFIG.MAX_RECORDS);
      } else if (count > CONFIG.MAX_RECORDS) {
        console.warn(`[FormLogger] Приближение к лимиту: ${count}/${CONFIG.HARD_LIMIT_RECORDS}`);
      }
      
      // 3. Проверка размера
      const size = await this._getDBSize();
      if (size && parseFloat(size.usedMB) > CONFIG.MAX_SIZE_MB) {
        console.warn(`[FormLogger] Большой размер БД: ${size.usedMB} MB`);
      }
      
    } catch (e) {
      console.error('[FormLogger] Ошибка обслуживания:', e);
    }
  }

  /**
   * Обрезать БД до указанного количества записей (удаляет старые)
   */
  async _trimToLimit(targetCount) {
    const db = await this._ensureDB();
    const currentCount = await this.getRecordsCount();
    
    if (currentCount <= targetCount) return 0;
    
    const toDelete = currentCount - targetCount;
    console.log(`[FormLogger] Удаление ${toDelete} старых записей...`);
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestampMs');
      const request = index.openCursor(null, 'next'); // От старых к новым
      
      let deleted = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && deleted < toDelete) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          console.log(`[FormLogger] Удалено ${deleted} записей`);
          this._invalidateCache();
          resolve(deleted);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получить количество записей (быстрый метод)
   */
  async getRecordsCount() {
    const db = await this._ensureDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получить информацию о здоровье БД
   */
  async getHealth() {
    const [count, size] = await Promise.all([
      this.getRecordsCount(),
      this._getDBSize()
    ]);
    
    const countPercent = (count / CONFIG.HARD_LIMIT_RECORDS) * 100;
    const sizePercent = size ? (parseFloat(size.usedMB) / CONFIG.MAX_SIZE_MB) * 100 : 0;
    
    let status = 'ok';
    let message = 'БД в норме';
    
    if (countPercent > 90 || sizePercent > 90) {
      status = 'critical';
      message = 'Требуется очистка';
    } else if (countPercent > 70 || sizePercent > 70) {
      status = 'warning';
      message = 'Приближение к лимиту';
    }
    
    return {
      status,
      message,
      records: {
        current: count,
        limit: CONFIG.HARD_LIMIT_RECORDS,
        percent: countPercent.toFixed(1),
      },
      size: {
        current: size?.usedMB || '?',
        limit: CONFIG.MAX_SIZE_MB,
        percent: sizePercent.toFixed(1),
      },
      config: CONFIG,
    };
  }

  _invalidateCache() {
    this._statsCache = null;
    this._statsCacheTime = 0;
  }

  // ===================== КОНФИГУРАЦИЯ =====================

  setMaxAgeDays(days) {
    this.maxAgeDays = days;
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
        
        request.onsuccess = () => {
          this._invalidateCache();
          resolve(logEntry.id);
        };
        request.onerror = () => reject(request.error);
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

  // ===================== ПОЛУЧЕНИЕ ЛОГОВ (ОПТИМИЗИРОВАННОЕ) =====================

  /**
   * ОПТИМИЗАЦИЯ: Использовать cursor с лимитом вместо getAll()
   */
  async getLogs({
    name = null,
    comState = null,
    date = null,
    action = null,
    fromDate = null,
    toDate = null,
    page = 1,
    limit = 50
  } = {}) {
    try {
      const db = await this._ensureDB();
      
      // Если есть фильтр по дате - используем индекс
      if (date && !name && !comState && !action) {
        return this._getLogsByDateIndex(date, page, limit);
      }
      
      // Если есть фильтр по comState.id - используем индекс
      if (comState?.id && !name && !action && !date) {
        return this._getLogsByComIdIndex(comState.id, page, limit);
      }
      
      // Иначе - фильтрация в памяти (но с лимитом!)
      return this._getLogsWithFilter({ name, comState, date, action, fromDate, toDate, page, limit });
      
    } catch (e) {
      console.error('[FormLogger] Ошибка получения логов:', e);
      return [];
    }
  }

  /**
   * Быстрый запрос по индексу даты
   */
  async _getLogsByDateIndex(date, page, limit) {
    const db = await this._ensureDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('date');
      const request = index.getAll(IDBKeyRange.only(date));
      
      request.onsuccess = () => {
        let logs = request.result || [];
        logs.sort((a, b) => b.timestampMs - a.timestampMs);
        
        // Пагинация
        const start = (page - 1) * limit;
        logs = logs.slice(start, start + limit);
        
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Быстрый запрос по индексу comState.id
   */
  async _getLogsByComIdIndex(comId, page, limit) {
    const db = await this._ensureDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('comId');
      const request = index.getAll(IDBKeyRange.only(String(comId)));
      
      request.onsuccess = () => {
        let logs = request.result || [];
        logs.sort((a, b) => b.timestampMs - a.timestampMs);
        
        const start = (page - 1) * limit;
        logs = logs.slice(start, start + limit);
        
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Фильтрация с ограничением выборки
   */
  async _getLogsWithFilter({ name, comState, date, action, fromDate, toDate, page, limit }) {
    const db = await this._ensureDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestampMs');
      
      // Используем cursor от новых к старым
      const request = index.openCursor(null, 'prev');
      
      const results = [];
      const skip = (page - 1) * limit;
      let scanned = 0;
      let matched = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        // Лимит сканирования для защиты от зависания
        if (!cursor || scanned > CONFIG.QUERY_LIMIT) {
          resolve(results);
          return;
        }
        
        scanned++;
        const log = cursor.value;
        
        // Применяем фильтры
        if (this._matchesFilter(log, { name, comState, date, action, fromDate, toDate })) {
          matched++;
          
          // Пропускаем до нужной страницы
          if (matched > skip && results.length < limit) {
            results.push(log);
          }
          
          // Достаточно результатов
          if (results.length >= limit) {
            resolve(results);
            return;
          }
        }
        
        cursor.continue();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Проверка соответствия фильтрам
   */
  _matchesFilter(log, { name, comState, date, action, fromDate, toDate }) {
    // Фильтр по названию
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

    // Фильтр по action
    if (action) {
      if (Array.isArray(action) && action.length > 0) {
        if (!action.includes(log.action)) return false;
      } else if (typeof action === 'string' && action !== '') {
        if (log.action !== action) return false;
      }
    }

    // Фильтр по дате
    if (date && log.date !== date) return false;

    // Фильтр по диапазону
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      if (log.timestampMs < from) return false;
    }
    if (toDate) {
      const to = new Date(toDate).getTime() + 24 * 60 * 60 * 1000;
      if (log.timestampMs > to) return false;
    }

    return true;
  }

  /**
   * Получить количество с фильтрами (оптимизированное)
   */
  async getLogsCount(filters = {}) {
    // Если нет фильтров - быстрый count
    if (!filters || Object.values(filters).every(v => !v || (Array.isArray(v) && v.length === 0))) {
      return this.getRecordsCount();
    }
    
    // С фильтрами - считаем через cursor (но с лимитом)
    const db = await this._ensureDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestampMs');
      const request = index.openCursor(null, 'prev');
      
      let count = 0;
      let scanned = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (!cursor || scanned > CONFIG.QUERY_LIMIT) {
          resolve(count);
          return;
        }
        
        scanned++;
        
        if (this._matchesFilter(cursor.value, filters)) {
          count++;
        }
        
        cursor.continue();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получить данные для heatmap (кэшированные)
   */
  async getHeatmapData(days = 90) {
    const db = await this._ensureDB();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestampMs');
      const range = IDBKeyRange.lowerBound(cutoff);
      const request = index.openCursor(range);
      
      const heatmap = {};
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const date = cursor.value.date;
          if (date) {
            heatmap[date] = (heatmap[date] || 0) + 1;
          }
          cursor.continue();
        } else {
          resolve(heatmap);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getLogsByOrg(orgId) {
    return this.getLogs({ comState: { id: String(orgId) }, limit: 1000 });
  }

  async getSessionLogs() {
    const db = await this._ensureDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('sessionId');
      const request = index.getAll(IDBKeyRange.only(this.sessionId));
      
      request.onsuccess = () => {
        const logs = (request.result || []).sort((a, b) => b.timestampMs - a.timestampMs);
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getRecentLogs(minutes = 60) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.getLogs({ fromDate: new Date(cutoff).toISOString(), limit: 500 });
  }

  async getStats() {
    // Используем кэш (5 секунд)
    if (this._statsCache && Date.now() - this._statsCacheTime < 5000) {
      return this._statsCache;
    }
    
    const [count, size, health] = await Promise.all([
      this.getRecordsCount(),
      this._getDBSize(),
      this.getHealth()
    ]);

    const stats = {
      totalLogs: count,
      dbSize: size,
      health,
      currentSession: this.sessionId,
      maxAgeDays: this.maxAgeDays,
      config: CONFIG,
    };
    
    this._statsCache = stats;
    this._statsCacheTime = Date.now();
    
    return stats;
  }

  // ===================== ЭКСПОРТ =====================

  async exportToFile(filename = null, filter = {}) {
    const logs = await this.getLogs({ ...filter, limit: 10000 });

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
    a.download = filename || `form_logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return exportData;
  }

  async copyToClipboard(filter = {}) {
    const logs = await this.getLogs({ ...filter, limit: 1000 });
    await navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
    console.log('[FormLogger] Скопировано записей:', logs.length);
  }

  // ===================== ОЧИСТКА =====================

  async clearAll() {
    const db = await this._ensureDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => {
        this._invalidateCache();
        console.log('[FormLogger] Все логи очищены');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearOlderThan(days) {
    const db = await this._ensureDB();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestampMs');
      const range = IDBKeyRange.upperBound(cutoff);
      const request = index.openCursor(range);
      
      let deleted = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          if (deleted > 0) {
            this._invalidateCache();
            console.log(`[FormLogger] Удалено ${deleted} записей старше ${days} дней`);
          }
          resolve(deleted);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async clearByOrg(orgId) {
    const logs = await this.getLogsByOrg(orgId);
    const db = await this._ensureDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      logs.forEach(log => store.delete(log.id));
      
      tx.oncomplete = () => {
        this._invalidateCache();
        resolve(logs.length);
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  // ===================== ПРИВАТНЫЕ МЕТОДЫ =====================

  _sanitizeData(data) {
    try {
      const str = JSON.stringify(data);
      if (str.length > 500000) {
        return {
          _truncated: true,
          _originalSize: str.length,
          _preview: str.slice(0, 10000),
        };
      }
      return JSON.parse(str);
    } catch (e) {
      return { _serializationError: e.message };
    }
  }

  _compactFormData(formValues) {
    if (!formValues || typeof formValues !== 'object') return formValues;
    
    const compact = {};
    
    for (const [key, value] of Object.entries(formValues)) {
      if (Array.isArray(value)) {
        const modified = value.filter(item => 
          item?._modified || item?.command || String(item?.id).startsWith('new_')
        );
        if (modified.length > 0) compact[key] = modified;
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
    let id = sessionStorage.getItem('torg_session_id');
    if (!id) {
      id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      sessionStorage.setItem('torg_session_id', id);
    }
    return id;
  }

  async _getDBSize() {
    try {
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        return {
          used: est.usage,
          usedMB: (est.usage / 1024 / 1024).toFixed(2),
          quota: est.quota,
          quotaMB: (est.quota / 1024 / 1024).toFixed(2),
          percent: ((est.usage / est.quota) * 100).toFixed(2),
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
// ТИПЫ И КОНФИГУРАЦИЯ
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
  ITEM_ADD: { label: 'Добавление', color: '#95de64', icon: '➕' },
  ITEM_DELETE: { label: 'Удаление', color: '#ff7875', icon: '➖' },
  ITEM_UPDATE: { label: 'Обновление', color: '#69c0ff', icon: '🔄' },
  CURATOR_REQUEST: { label: 'Запрос кураторства', color: '#597ef7', icon: '👤' },
  CURATOR_REQUEST_RESULT: { label: 'Результат кураторства', color: '#85a5ff', icon: '👥' },
  CURATOR_REQUEST_FAILED: { label: 'Ошибка кураторства', color: '#ff7875', icon: '👤❌' },
};

export const useFormLogger = (orgId, orgName = null) => {
  const log = (action, data = {}) => formLogger.log(action, data, { orgId, orgName });
  const logChange = (field, value, extra = {}) => formLogger.log(LOG_ACTIONS.FIELD_CHANGE, { field, value, ...extra }, { orgId, orgName });
  const logSnapshot = (formValues, action = LOG_ACTIONS.FORM_SNAPSHOT) => formLogger.logFormState(action, formValues, { orgId, orgName });
  const logFullSnapshot = (formValues, action = LOG_ACTIONS.FORM_SNAPSHOT) => formLogger.logFullFormState(action, formValues, { orgId, orgName });
  const logBeforeSave = (payload) => formLogger.logBeforeSave(payload, { orgId, orgName });
  const logError = (errorType, error, context = {}) => formLogger.logError(errorType, error, { ...context, orgId, orgName });

  return { log, logChange, logSnapshot, logFullSnapshot, logBeforeSave, logError };
};
