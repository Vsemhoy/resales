export const COMPANY_PHONE = {
  '2': '+7 (812) 207-50-97',
  '3': '+7 (812) 339-8972',
}

export const COMPANY_SITE = {
  '2': 'arstel.com',
  '3': 'rondo-sound.ru',
}

export function capitalizeFirstLetter(value = '') {
  return String(value).replace(/[A-Za-zА-Яа-яЁё]/, letter => letter.toLocaleUpperCase('ru-RU'))
}

export function defaultManagerContacts(companyId, email = '') {
  return [COMPANY_PHONE[String(companyId)] ?? '', email, COMPANY_SITE[String(companyId)] ?? '']
    .filter(Boolean)
    .join('\n')
}
