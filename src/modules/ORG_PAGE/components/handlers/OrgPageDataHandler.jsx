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