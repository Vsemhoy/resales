/**
 * FormLogger.js - Сервис логирования с настройками из localStorage
 * 
 * НАСТРОЙКИ (localStorage 'formlogger_settings'):
 * - enabled: включено ли логирование
 * - saveSnapshots: сохранять ли снимки форм
 * - maxAgeDays: максимальный возраст логов в днях (5-90)
 * - maxSizeMB: максимальный размер БД в МБ (5-100)
 */

const DB_NAME = 'torg_form_logs_db';
const DB_VERSION = 3;
const STORE_NAME = 'logs';
const SETTINGS_KEY = 'formlogger_settings';

// ===================== НАСТРОЙКИ ПО УМОЛЧАНИЮ =====================
const DEFAULT_SETTINGS = {
  enabled: true,
  saveSnapshots: false,
  maxAgeDays: 30,
  maxSizeMB: 20,
};

// ===================== ЛИМИТЫ =====================
const CONFIG = {
  HARD_LIMIT_RECORDS: 50000,
  MAINTENANCE_INTERVAL: 60000,
  MIN_SIZE_MB: 5,
  MAX_SIZE_MB: 100,
  MIN_DAYS: 5,
  MAX_DAYS: 90,
};

// ===================== DEBUG =====================
const DEBUG = false;
const log = (...args) => DEBUG && console.log('[FormLogger]', ...args);
const logError = (...args) => console.error('[FormLogger]', ...args);

class FormLoggerService {
  constructor() {
    this.db = null;
    this.sessionId = this._generateSessionId();
    this.userId = null;
    this.user_role = null;
    this.userName = null;
    
    this.com_id = null;
    this.com_curator = null;
    this.com_editor = null;
    this.com_state = null;
    this.com_idcom = null;
    this.com_name = null;

    this._statsCache = null;
    this._statsCacheTime = 0;
    this._isInitializing = false;
    this._initPromise = null;
    this._maintenanceTimer = null;
    
    // Загружаем настройки
    this._settings = this._loadSettings();
    
    // Инициализация БД
    this._initPromise = this._initDB();
    
    // Запускаем периодическое обслуживание
    this._startMaintenance();
  }

  // ===================== НАСТРОЙКИ =====================

  _loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      logError('Error loading settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  _saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this._settings));
      log('Settings saved:', this._settings);
    } catch (e) {
      logError('Error saving settings:', e);
    }
  }

  getSettings() {
    return { ...this._settings };
  }

  updateSettings(newSettings) {
    if (newSettings.maxAgeDays !== undefined) {
      newSettings.maxAgeDays = Math.max(CONFIG.MIN_DAYS, Math.min(CONFIG.MAX_DAYS, newSettings.maxAgeDays));
    }
    if (newSettings.maxSizeMB !== undefined) {
      newSettings.maxSizeMB = Math.max(CONFIG.MIN_SIZE_MB, Math.min(CONFIG.MAX_SIZE_MB, newSettings.maxSizeMB));
    }
    
    this._settings = { ...this._settings, ...newSettings };
    this._saveSettings();
    this._invalidateCache();
    
    // Если изменились лимиты - запускаем очистку
    if (newSettings.maxAgeDays !== undefined || newSettings.maxSizeMB !== undefined) {
      this._performMaintenance();
    }
    
    return this._settings;
  }

  setEnabled(enabled) {
    return this.updateSettings({ enabled: !!enabled });
  }

  setSaveSnapshots(saveSnapshots) {
    return this.updateSettings({ saveSnapshots: !!saveSnapshots });
  }

  /** @deprecated Используйте updateSettings({ maxAgeDays }) или панель настроек */
  setMaxAgeDays(days) {
    log('setMaxAgeDays() ignored - settings are managed via localStorage');
  }

  // ===================== ИНИЦИАЛИЗАЦИЯ =====================

//   async _initDB() {
   
//     if (this._isInitializing) return this._initPromise;
    
//     this._isInitializing = true;

//     return new Promise((resolve, reject) => {
//       try {
//         const request = indexedDB.open(DB_NAME, DB_VERSION);

//  console.log('INIT DB', request);

//         request.onerror = () => {
//           logError('DB open error:', request.error);
//           this._isInitializing = false;
//           reject(request.error);
//         };

//         request.onsuccess = () => {
//           this.db = request.result;
//           this._isInitializing = false;
          
//           this.db.onerror = (e) => logError('DB error:', e.target.error);
//           this.db.onclose = () => { this.db = null; };
          
//           resolve(this.db);
//         };

//         request.onupgradeneeded = (event) => {
//           const db = event.target.result;
          
//           if (db.objectStoreNames.contains(STORE_NAME)) {
//             db.deleteObjectStore(STORE_NAME);
//           }
          
//           const store = db.createObjectStore(STORE_NAME, { 
//             keyPath: 'id',
//             autoIncrement: false 
//           });
          
//           store.createIndex('timestampMs', 'timestampMs', { unique: false });
//           store.createIndex('sessionId', 'sessionId', { unique: false });
//           store.createIndex('action', 'action', { unique: false });
//           store.createIndex('date', 'date', { unique: false });
//           store.createIndex('comId', 'comState.id', { unique: false });
//         };

//         request.onblocked = () => logError('DB blocked!');

//       } catch (e) {
//         this._isInitializing = false;
//         reject(e);
//       }
//     });
//   }

async _initDB() {
  if (this._isInitializing) return this._initPromise;
  if (this.db) return this.db;

  this._isInitializing = true;

  this._initPromise = new Promise((resolve, reject) => {
    log('Opening DB...', DB_NAME, DB_VERSION);
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);


    // request.onupgradeneeded = (event) => {
    //   console.log('[IDB] onupgradeneeded сработал');
    //   const db = event.target.result;
    //   if (!db.objectStoreNames.contains('logs')) {
    //     console.log('[IDB] Создаём хранилище "logs"');
    //     const store = db.createObjectStore('logs', { keyPath: 'id' });
    //     store.createIndex('timestampMs', 'timestampMs', { unique: false });
    //     store.createIndex('date', 'date', { unique: false });
    //     store.createIndex('comState.id', 'comState.id', { unique: false });
    //   }
    // };

    request.onupgradeneeded = (event) => {
    try {
      log('onupgradeneeded');
      const db = event.target.result;
      const oldVersion = event.oldVersion; // может быть 0

      if (!db.objectStoreNames.contains('logs')) {
        log('Creating logs object store');
        const store = db.createObjectStore('logs', { keyPath: 'id' });
        store.createIndex('timestampMs', 'timestampMs', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('comState.id', 'comState.id', { unique: false });
      } else {
        // Если хранилище уже есть, но нужно обновить — делай аккуратно!
        // Например, проверь, есть ли уже нужный индекс:
        const store = event.target.transaction.objectStore('logs');
        if (!store.indexNames.contains('comState.id')) {
          store.createIndex('comState.id', 'comState.id', { unique: false });
        }
      }
    } catch (err) {
      logError('onupgradeneeded error:', err);
      // Без этого ошибка "утонет"
    }
  };

    request.onsuccess = (event) => {
      log('DB opened');
      const openedDb = event.target.result;
      this.db = openedDb;
      this._isInitializing = false;
      this._initPromise = null;
      openedDb.onclose = () => {
        log('DB closed');
        this._resetDbState();
      };
      openedDb.onversionchange = () => {
        log('DB versionchange: closing active connection');
        try { openedDb.close(); } catch (e) {}
        this._resetDbState();
      };
      resolve(openedDb);
    };

    request.onerror = (event) => {
      logError('DB open error:', event.target.error);
      this._resetDbState();
      reject(event.target.error);
    };
    request.onblocked = () => {
      log('DB open blocked');
    };
  });

  return this._initPromise;
}

  // async _ensureDB() {
  //   if (this.db) return this.db;
  //   if (this._initPromise) {
  //     await this._initPromise;
  //     return this.db;
  //   }
  //   this._initPromise = this._initDB();
  //   return this._initPromise;
  // }

  async _ensureDB() {
    if (this.db) return this.db;
    return this._initDB();
  }

  // ===================== ОБСЛУЖИВАНИЕ БД =====================

  _startMaintenance() {
    setTimeout(() => this._performMaintenance(), 5000);
    this._maintenanceTimer = setInterval(() => this._performMaintenance(), CONFIG.MAINTENANCE_INTERVAL);
  }

  async _performMaintenance() {
    if (!this._settings.enabled) return;
    
    try {
      // 1. Очистка по возрасту
      await this._clearOlderThanInternal(this._settings.maxAgeDays);
      
      // 2. Проверка размера
      const size = await this._getDBSize();
      if (size && parseFloat(size.usedMB) > this._settings.maxSizeMB) {
        log(`Size limit exceeded: ${size.usedMB}MB > ${this._settings.maxSizeMB}MB`);
        await this._trimBySize();
      }
      
      // 3. Проверка количества
      const count = await this.getRecordsCount();
      if (count > CONFIG.HARD_LIMIT_RECORDS) {
        await this._trimToLimit(CONFIG.HARD_LIMIT_RECORDS * 0.8);
      }
    } catch (e) {
      if (this._isDbClosingError(e)) {
        log('Maintenance skipped: DB is closing');
        return;
      }
      logError('Maintenance error:', e);
    }
  }

  async _trimBySize() {
    const targetSizeMB = this._settings.maxSizeMB * 0.8;
    let currentSize = await this._getDBSize();
    let iterations = 0;
    
    while (currentSize && parseFloat(currentSize.usedMB) > targetSizeMB && iterations < 10) {
      const count = await this.getRecordsCount();
      await this._deleteOldestRecords(Math.max(100, Math.floor(count * 0.2)));
      currentSize = await this._getDBSize();
      iterations++;
    }
  }

  async _deleteOldestRecords(count) {
    return this._withStore('readwrite', (store, resolve, reject) => {
      const index = store.index('timestampMs');
      const request = index.openCursor(null, 'next');
      
      let deleted = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && deleted < count) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          this._invalidateCache();
          resolve(deleted);
        }
      };
      
      request.onerror = () => reject(request.error);
    }, 0);
  }

  async _trimToLimit(targetCount) {
    const currentCount = await this.getRecordsCount();
    if (currentCount <= targetCount) return 0;
    return this._deleteOldestRecords(currentCount - targetCount);
  }

  // ===================== КОНФИГУРАЦИЯ =====================

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

  _canLog(action) {
    if (!this._settings.enabled) return false;
    
    if (!this._settings.saveSnapshots) {
      const snapshotActions = ['FORM_SNAPSHOT', 'AUTO_SNAPSHOT', 'EMERGENCY_SNAPSHOT'];
      if (snapshotActions.includes(action)) return false;
    }
    
    return true;
  }

  // async log(action, data, meta = {}) {
  //   if (!this._canLog(action)) return null;
    
  //   try {
  //     const db = await this._ensureDB();
  //     if (!db) return null;
      
  //     const now = new Date();
      
  //     const logEntry = {
  //       id: this._generateId(),
  //       timestamp: now.toISOString(),
  //       timestampMs: now.getTime(),
  //       date: now.toISOString().slice(0, 10),
  //       sessionId: this.sessionId,
  //       userId: this.userId,
  //       userName: this.userName,
  //       userRole: this.user_role,
  //       comState: {
  //         id: this.com_id,
  //         editor_id: this.com_editor,
  //         state: this.com_state,
  //         curator_id: this.com_curator,
  //         id_company: this.com_idcom,
  //         name: this.com_name
  //       },
  //       action,
  //       data: this._sanitizeData(data),
  //       meta: { ...meta, url: window.location.href, pathname: window.location.pathname },
  //     };

  //     return new Promise((resolve, reject) => {
  //       const tx = db.transaction(STORE_NAME, 'readwrite');
  //       const store = tx.objectStore(STORE_NAME);
  //       const request = store.add(logEntry);
        
  //       request.onsuccess = () => { this._invalidateCache(); resolve(logEntry.id); };
  //       request.onerror = () => reject(request.error);
  //     });
  //   } catch (e) {
  //     logError('Log error:', e);
  //     return null;
  //   }
  // }

    async log(action, data, meta = {}) {
      if (action === 'FORM_SNAPSHOT' && this._settings.saveSnapshots === false) {
        return null;
      }
      if (!this._canLog(action)) return null;

    try {
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

      return this._withStore('readwrite', (store, resolve, reject) => {
        const request = store.add(logEntry);
        
        request.onsuccess = () => resolve(logEntry.id);
        request.onerror = () => {
          logError('Write error:', request.error);
          reject(request.error);
        };
      }, null);
    } catch (e) {
      logError('Log write failed:', e);
      return null;
    }
  }

  logFireAndForget(action, data, meta = {}) {
    Promise.resolve()
      .then(() => this.log(action, data, meta))
      .catch((e) => logError('Non-blocking log failed:', e));
    return null;
  }

  async testWrite() {
  try {
    const db = await this._initDB();
    const entry = { test: true, timestamp: Date.now() };
    
    const tx = db.transaction('logs', 'readwrite');
    const store = tx.objectStore('logs');
    
    const req = store.add(entry);
    
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        log('testWrite success');
        resolve();
      };
      req.onerror = (e) => {
        logError('testWrite write error:', e.target.error);
        reject(e.target.error);
      };
    });
  } catch (err) {
    logError('testWrite init error:', err);
  }
}

  async logFormState(action, formValues, meta = {}) {
    return this.log(action, this._compactFormData(formValues), { ...meta, isFormSnapshot: true });
  }

  async logFullFormState(action, formValues, meta = {}) {
    return this.log(action, formValues, { ...meta, isFullSnapshot: true });
  }

  async logBeforeSave(payload, meta = {}) {
    return this.log('BEFORE_SAVE', payload, { ...meta, isSaveAttempt: true });
  }

  async logSaveSuccess(response, meta = {}) {
    return this.log('SAVE_SUCCESS', { status: response?.status, data: response?.data }, meta);
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

  async getRecordsCount() {
    try {
      return this._withStore('readonly', (store, resolve, reject) => {
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  // async getLogs({ name = null, comState = null, date = null, action = null, fromDate = null, toDate = null, page = 1, limit = 50 } = {}) {
  //   try {
  //     const db = await this._ensureDB();
  //     if (!db) return [];
      
  //     return new Promise((resolve, reject) => {
  //       const tx = db.transaction(STORE_NAME, 'readonly');
  //       const store = tx.objectStore(STORE_NAME);
  //       const request = store.getAll();
        
  //       request.onsuccess = () => {
  //         let logs = request.result || [];
  //         logs.sort((a, b) => b.timestampMs - a.timestampMs);
  //         logs = this._filterLogs(logs, { name, comState, date, action, fromDate, toDate });
          
  //         const start = (page - 1) * limit;
  //         resolve(logs.slice(start, start + limit));
  //       };
        
  //       request.onerror = () => reject(request.error);
  //     });
  //   } catch (e) {
  //     return [];
  //   }
  // }

  async getLogs({ name = null, comState = null, date = null, action = null, fromDate = null, toDate = null, page = 1, limit = 50 } = {}) {
    try {
      return this._withStore('readonly', (store, resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          let logs = request.result || [];
          logs.sort((a, b) => b.timestampMs - a.timestampMs);
          logs = this._filterLogs(logs, { name, comState, date, action, fromDate, toDate });
          
          const start = (page - 1) * limit;
          resolve(logs.slice(start, start + limit));
        };
        
        request.onerror = () => reject(request.error);
      }, []);
    } catch (e) {
      return [];
    }
  }

  _filterLogs(logs, { name, comState, date, action, fromDate, toDate }) {
    return logs.filter(log => {
      if (name) {
        const logName = log.data?.main?.name || log.comState?.name || '';
        if (!logName.toLowerCase().includes(name.toLowerCase())) return false;
      }

      if (comState && Object.keys(comState).length > 0) {
        for (const [key, value] of Object.entries(comState)) {
          if (value === undefined || value === null || value === '') continue;
          if (String(log.comState?.[key]) !== String(value)) return false;
        }
      }

      if (action) {
        if (Array.isArray(action) && action.length > 0) {
          if (!action.includes(log.action)) return false;
        } else if (typeof action === 'string') {
          if (log.action !== action) return false;
        }
      }

      if (date && log.date !== date) return false;
      if (fromDate && log.timestampMs < new Date(fromDate).getTime()) return false;
      if (toDate && log.timestampMs > new Date(toDate).getTime() + 86400000) return false;

      return true;
    });
  }

  async getLogsCount(filters = {}) {
    try {
      const hasFilters = Object.values(filters).some(v => v && (!Array.isArray(v) || v.length > 0));
      if (!hasFilters) return this.getRecordsCount();

      return this._withStore('readonly', (store, resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => resolve(this._filterLogs(request.result || [], filters).length);
        request.onerror = () => reject(request.error);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  async getHeatmapData(days = 90) {
    try {
      const db = await this._ensureDB();
      if (!db) return {};
      
      const cutoff = Date.now() - days * 86400000;
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const heatmap = {};
          (request.result || []).forEach(log => {
            if (log.timestampMs >= cutoff && log.date) {
              heatmap[log.date] = (heatmap[log.date] || 0) + 1;
            }
          });
          resolve(heatmap);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return {};
    }
  }

  async getHealth() {
    const [count, size] = await Promise.all([this.getRecordsCount(), this._getDBSize()]);
    const settings = this.getSettings();
    
    const countPercent = (count / CONFIG.HARD_LIMIT_RECORDS) * 100;
    const sizePercent = size ? (parseFloat(size.usedMB) / settings.maxSizeMB) * 100 : 0;
    
    let status = 'ok', message = 'БД в норме';
    if (countPercent > 90 || sizePercent > 90) { status = 'critical'; message = 'Требуется очистка'; }
    else if (countPercent > 70 || sizePercent > 70) { status = 'warning'; message = 'Приближение к лимиту'; }
    
    return {
      status, message,
      records: { current: count, limit: CONFIG.HARD_LIMIT_RECORDS, percent: countPercent.toFixed(1) },
      size: { current: size?.usedMB || '0', limit: settings.maxSizeMB, percent: sizePercent.toFixed(1) },
      settings,
    };
  }

  async getStats() {
    if (this._statsCache && Date.now() - this._statsCacheTime < 5000) return this._statsCache;
    
    const [count, size, health] = await Promise.all([this.getRecordsCount(), this._getDBSize(), this.getHealth()]);
    
    this._statsCache = { totalLogs: count, dbSize: size, health, currentSession: this.sessionId, settings: this.getSettings() };
    this._statsCacheTime = Date.now();
    
    return this._statsCache;
  }

  async getLogsByOrg(orgId) {
    return this.getLogs({ comState: { id: String(orgId) }, limit: 1000 });
  }

  async getSessionLogs() {
    try {
      return this._withStore('readonly', (store, resolve, reject) => {
        const index = store.index('sessionId');
        const request = index.getAll(IDBKeyRange.only(this.sessionId));
        
        request.onsuccess = () => resolve((request.result || []).sort((a, b) => b.timestampMs - a.timestampMs));
        request.onerror = () => reject(request.error);
      }, []);
    } catch (e) {
      return [];
    }
  }

  // ===================== ЭКСПОРТ =====================

  async exportToFile(filename = null, filter = {}) {
    const logs = await this.getLogs({ ...filter, limit: 10000 });
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: { sessionId: this.sessionId, userId: this.userId, userName: this.userName },
      settings: this.getSettings(),
      filter,
      totalLogs: logs.length,
      logs,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || `form_logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return exportData;
  }

  // ===================== ОЧИСТКА =====================

  async clearAll() {
    try {
      return this._withStore('readwrite', (store, resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => { this._invalidateCache(); resolve(); };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      logError('clearAll error:', e);
    }
  }

  async clearOlderThan(days) {
    return this._clearOlderThanInternal(days);
  }

  async _clearOlderThanInternal(days) {
    try {
      const cutoff = Date.now() - days * 86400000;
      
      return this._withStore('readwrite', (store, resolve, reject, tx) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          const toDelete = (request.result || []).filter(l => l.timestampMs < cutoff);
          toDelete.forEach(l => store.delete(l.id));
          
          tx.oncomplete = () => {
            if (toDelete.length) this._invalidateCache();
            resolve(toDelete.length);
          };
        };
        request.onerror = () => reject(request.error);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  async clearByOrg(orgId) {
    const logs = await this.getLogsByOrg(orgId);
    if (!logs.length) return 0;

    return this._withStore('readwrite', (store, resolve, reject, tx) => {
      logs.forEach(l => store.delete(l.id));
      tx.oncomplete = () => { this._invalidateCache(); resolve(logs.length); };
      tx.onerror = () => reject(tx.error);
    }, 0);
  }

  // ===================== ПРИВАТНЫЕ МЕТОДЫ =====================

  _invalidateCache() { this._statsCache = null; this._statsCacheTime = 0; }

  _resetDbState() {
    this.db = null;
    this._isInitializing = false;
    this._initPromise = null;
  }

  _isDbClosingError(error) {
    const text = String(error?.message || error || '').toLowerCase();
    return text.includes('connection is closing') || text.includes('database connection is closing');
  }

  async _withStore(mode, executor, fallback = null, attempt = 0) {
    try {
      const db = await this._ensureDB();
      if (!db) return fallback;
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        executor(store, resolve, reject, tx);
      });
    } catch (e) {
      if ((this._isDbClosingError(e) || e?.name === 'InvalidStateError') && attempt < 1) {
        this._resetDbState();
        return this._withStore(mode, executor, fallback, attempt + 1);
      }
      throw e;
    }
  }

  _sanitizeData(data) {
    try {
      const str = JSON.stringify(data);
      if (str.length > 500000) return { _truncated: true, _originalSize: str.length, _preview: str.slice(0, 10000) };
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
        const modified = value.filter(item => item?._modified || item?.command || String(item?.id).startsWith('new_'));
        if (modified.length) compact[key] = modified;
      } else if (value !== null && value !== undefined && value !== '') {
        compact[key] = value;
      }
    }
    return compact;
  }

  _generateId() { return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }

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
          usedMB: (est.usage / 1048576).toFixed(2),
          quota: est.quota,
          quotaMB: (est.quota / 1048576).toFixed(2),
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
if (typeof window !== 'undefined') window.formLogger = formLogger;
export default formLogger;

// =============================================================================
// ТИПЫ
// =============================================================================

export const LOG_ACTIONS = {
  PAGE_OPEN: 'PAGE_OPEN', PAGE_CLOSE: 'PAGE_CLOSE', TAB_CHANGE: 'TAB_CHANGE',
  EDIT_MODE_ENTER: 'EDIT_MODE_ENTER', EDIT_MODE_EXIT: 'EDIT_MODE_EXIT',
  FIELD_CHANGE: 'FIELD_CHANGE', FIELD_BLUR: 'FIELD_BLUR',
  ITEM_ADD: 'ITEM_ADD', ITEM_DELETE: 'ITEM_DELETE', ITEM_UPDATE: 'ITEM_UPDATE',
  BEFORE_SAVE: 'BEFORE_SAVE', SAVE_SUCCESS: 'SAVE_SUCCESS', SAVE_ERROR: 'SAVE_ERROR',
  FORM_SNAPSHOT: 'FORM_SNAPSHOT', AUTO_SNAPSHOT: 'AUTO_SNAPSHOT', EMERGENCY_SNAPSHOT: 'EMERGENCY_SNAPSHOT', FORM_RESET: 'FORM_RESET',
  ERROR: 'ERROR', VALIDATION_ERROR: 'VALIDATION_ERROR', NETWORK_ERROR: 'NETWORK_ERROR',
  CURATOR_REQUEST: 'CURATOR_REQUEST', CURATOR_REQUEST_RESULT: 'CURATOR_REQUEST_RESULT', CURATOR_REQUEST_FAILED: 'CURATOR_REQUEST_FAILED',
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
  BEFORE_SAVE: { label: 'Перед сохранением', color: '#ff843dff', icon: '💾' },
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

export const useFormLogger = (orgId, orgName = null) => ({
  log: (action, data = {}) => formLogger.logFireAndForget(action, data, { orgId, orgName }),
  logChange: (field, value, extra = {}) => formLogger.logFireAndForget(LOG_ACTIONS.FIELD_CHANGE, { field, value, ...extra }, { orgId, orgName }),
  logSnapshot: (formValues, action = LOG_ACTIONS.FORM_SNAPSHOT) => formLogger.logFireAndForget(action, formLogger._compactFormData(formValues), { orgId, orgName, isFormSnapshot: true }),
  logFullSnapshot: (formValues, action = LOG_ACTIONS.FORM_SNAPSHOT) => formLogger.logFireAndForget(action, formValues, { orgId, orgName, isFullSnapshot: true }),
  logBeforeSave: (payload) => formLogger.logFireAndForget('BEFORE_SAVE', payload, { orgId, orgName, isSaveAttempt: true }),
  logError: (errorType, error, context = {}) => formLogger.logFireAndForget('ERROR', {
    errorType,
    message: error?.message || String(error),
    stack: error?.stack,
    responseStatus: error?.response?.status,
    responseData: error?.response?.data,
    context,
  }, { isError: true, ...context, orgId, orgName }),
});
