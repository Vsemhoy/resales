export const MAIN_ORG_DATA_IGNORE_KEYS = [
    "statusmoney",
    "requisites",
    "region",
    "phones",
    "list",
    "legaladdresses",
    "emails",
    "deliverytype",
    "curator",
    "creator",
    "contacts",
    "address",
    "active_tolerance",
    "active_licenses_bo",
    "active_licenses",
  ];


export const MAIN_ORG_DATA_TO_FLUSH = [
  "warningcmpcount",
  "warningcmpcomment",
  "tv",
  "id_orgs8an_tolerance",
  "id_orgs8an_project",
  "id_orgs8an_phones",
  "id_orgs8an_notes",
  "id_orgs8an_meeting",
  "id_orgs8an_log",
  "id_orgs8an_licenses",
  "id_orgs8an_fax",
  "id_orgs8an_calls",
  "id_orgs8an_email",
  "id_orgs8an_address",
];


/**
 * Проверка на одинаковость объектов, если в новом есть новый ключ, вылетит ошибка и false
 * @param {*} newData 
 * @param {*} oldData 
 * @param {*} ignoreKeys 
 * @returns true, если одинаковые ключи и данные
 */
export const IsSameComparedSomeOrgData = (
  newData,
  oldData,
  ignoreKeys = MAIN_ORG_DATA_IGNORE_KEYS
) => {
  // Проверка, что оба аргумента — объекты
  if (!newData || typeof newData !== 'object' || !oldData || typeof oldData !== 'object') {
    console.log(newData, oldData);
    console.error('newData или oldData не являются объектами');
    return false;
  }

  // Проходим по всем ключам из newData
  for (const key in newData) {
    // Пропускаем ключи из ignoreKeys
    if (ignoreKeys.includes(key)) {
      continue;
    }

    // Если ключа нет в oldData — ошибка
    if (!(key in oldData)) {
      console.error(`Ключ "${key}" отсутствует в oldData`);
      return false;
    }

    const newValue = newData[key];
    const oldValue = oldData[key];

  // Нормализуем: если одно из значений — boolean или 0/1, приводим оба к числу
  const normalizeToNumber = (val) => {
    if (typeof val === 'boolean') {
      return val ? 1 : 0;
    }
    if (val === 0 || val === 1) {
      return val; // уже число
    }
    return val;
  };

  // Применяем нормализацию только если хотя бы одно из значений — boolean или 0/1
  const isNewBoolLike = typeof newValue === 'boolean' || newValue === 0 || newValue === 1;
  const isOldBoolLike = typeof oldValue === 'boolean' || oldValue === 0 || oldValue === 1;

  let normalizedNew = newValue;
  let normalizedOld = oldValue;

  if (isNewBoolLike || isOldBoolLike) {
    normalizedNew = normalizeToNumber(newValue);
    normalizedOld = normalizeToNumber(oldValue);
  }

    // Если оба — массивы → сравниваем длины
    if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      if (newValue.length !== oldValue.length) {
        return false;
      }
      continue;
    }

    // Если хотя бы один — объект (и не массив) → пропускаем (игнорируем)
    if (
      (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) ||
      (typeof oldValue === 'object' && oldValue !== null && !Array.isArray(oldValue))
    ) {
      continue;
    }

    // Сравниваем значения
    if (normalizedNew !== normalizedOld) {
      return false;
    }
  }

  return true;
};


/**
 * Очистка ненужных ключей в объекте
 * @param {*} newData 
 * @param {*} keysToFlush 
 * @returns  очищенный объект
 */
export const FlushOrgData = (newData, keysToFlush = MAIN_ORG_DATA_TO_FLUSH) => {
  if (!newData || typeof newData !== 'object') {
    return newData; // или throw, если нужно строго
  }

  const cleaned = {};
  for (const key in newData) {
    if (newData.hasOwnProperty(key) && !keysToFlush.includes(key)) {
      cleaned[key] = newData[key];
    }
  }
  return cleaned;
};

/**
 * Сравнивает два массива объектов по ID и содержимому.
 * 
 * @param {Array} newArray - Новый массив объектов
 * @param {Array} oldArray - Старый массив объектов
 * @param {Array<string>} ignoreKeys - Ключи, которые нужно игнорировать при сравнении объектов
 * @returns {boolean} - true, если массивы эквивалентны; иначе false
 */
export const IsSameComparedOrgArrays = (newArray, oldArray, ignoreKeys = []) => {
  // Проверка, что оба аргумента — массивы
  if (!Array.isArray(newArray) || !Array.isArray(oldArray)) {
    console.error('Оба аргумента должны быть массивами');
    return false;
  }

  // Если количество элементов разное — сразу false
  if (newArray.length !== oldArray.length) {
    return false;
  }

  // Если оба пустые — считаем равными
  if (newArray.length === 0) {
    return true;
  }

  // Создаём мапы по id для быстрого поиска
  const newMap = new Map();
  const oldMap = new Map();

  // Заполняем newMap и проверяем уникальность id
  for (const item of newArray) {
    if (typeof item !== 'object' || item === null || !('id' in item)) {
      console.error('Элемент в newArray не содержит id или не является объектом:', item);
      return false;
    }
    const id = item.id;
    if (newMap.has(id)) {
      console.error(`Дублирующийся id "${id}" в newArray`);
      return false;
    }
    newMap.set(id, item);
  }

  // Заполняем oldMap и проверяем уникальность id
  for (const item of oldArray) {
    if (typeof item !== 'object' || item === null || !('id' in item)) {
      console.error('Элемент в oldArray не содержит id или не является объектом:', item);
      return false;
    }
    const id = item.id;
    if (oldMap.has(id)) {
      console.error(`Дублирующийся id "${id}" в oldArray`);
      return false;
    }
    oldMap.set(id, item);
  }

  // Проверяем, что все id из newArray есть в oldArray (и наоборот — из-за одинаковой длины достаточно одного направления)
  for (const id of newMap.keys()) {
    if (!oldMap.has(id)) {
      console.error(`id "${id}" присутствует в newArray, но отсутствует в oldArray`);
      return false;
    }
  }

  // Теперь сравниваем каждый объект по id с учётом ignoreKeys
  for (const [id, newItem] of newMap.entries()) {
    const oldItem = oldMap.get(id);
    // Используем  метод сравнения объектов
    if (!IsSameComparedSomeOrgData(newItem, oldItem, ignoreKeys)) {
      return false;
    }
  }

  return true;
};