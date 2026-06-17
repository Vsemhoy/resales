export const ALL_SECTIONS = [
  { key: 'cover',           label: 'Обложка',                   draggable: false, target: null, required: false, engineerCapable: false },
  { key: 'toc',             label: 'Оглавление',                draggable: false, target: null, required: false, engineerCapable: false },
  { key: 'features',        label: 'Особенности системы',       draggable: true,  target: null, required: false, engineerCapable: true  },
  { key: 'selectEquipment', label: 'Выбор оборудования',        draggable: true,  target: null, required: false, engineerCapable: true  },
  { key: 'acoustic',        label: 'Акустический расчёт',       draggable: true,  target: 'p',  required: false, engineerCapable: true  },
  { key: 'specifications',  label: 'Спецификация',              draggable: true,  target: null, required: false, engineerCapable: false },
  { key: 'recommendations', label: 'Рекомендации',              draggable: true,  target: null, required: false, engineerCapable: true  },
  { key: 'systemChars',     label: 'Характеристики системы',    draggable: true,  target: null, required: false, engineerCapable: false },
  { key: 'rondoDelivery',   label: 'Условия оплаты и поставки', draggable: true,  target: null, required: false, engineerCapable: false },
  { key: 'specials',        label: 'Описание оборудования',     draggable: true,  target: null, required: false, engineerCapable: true  },
  { key: 'pageBreak',       label: '--- Разрыв страницы ---',   draggable: true,  target: null, required: false, engineerCapable: false },
]

export const CURRENCY_OPTIONS = [
  { value: '3', label: '₽' },
  { value: '1', label: '$' },
  { value: '2', label: '€' },
]

export const COMPANY_OPTIONS = [
  { value: '2', label: 'Arstel' },
  { value: '3', label: 'Rondo'  },
]

export const ORIENTATION_OPTIONS = [
  { value: 'v', label: 'Вертикальная'    },
  { value: 'h', label: 'Горизонтальная' },
]

export const TARGET_OPTIONS = [
  { value: 't', label: 'Трансляционная'   },
  { value: 'p', label: 'Профессиональная' },
]

export function getVisibleSections(targetSystem) {
  return ALL_SECTIONS.filter(s => s.target === null || s.target === targetSystem)
}

export const DEFAULT_SECTION_ORDER = ALL_SECTIONS
  .filter(s => s.key !== 'pageBreak')   // шаблон, не реальная секция
  .map(s => s.key)

export const DEFAULT_ENABLED = {
  cover:           true,
  toc:             false,
  features:        false,
  selectEquipment: false,
  acoustic:        false,
  specifications:  true,
  recommendations: false,
  systemChars:     true,
  rondoDelivery:   false,
  specials:        false,
  pageBreak:       false,
}

// ─── Кастомные блоки ──────────────────────────────────────────────────────────
export const CUSTOM_PREFIX = 'custom_'
export const isCustomKey   = (key) => key.startsWith(CUSTOM_PREFIX)
export const customKey     = (id)  => `${CUSTOM_PREFIX}${id}`
export const customId      = (key) => key.replace(CUSTOM_PREFIX, '')

export function makeCustomSection(id) {
  return {
    key:       customKey(id),
    label:     'Блок',
    draggable: true,
    target:    null,
    required:  false,
    isCustom:  true,
    customId:  id,
  }
}

// ─── Разрывы страниц ──────────────────────────────────────────────────────────
export const PAGEBREAK_PREFIX = 'pageBreak_'
export const isPageBreakKey   = (key) => key.startsWith(PAGEBREAK_PREFIX)

export function makePageBreakSection(key) {
  return {
    key,
    label:      '--- Разрыв страницы ---',
    draggable:  true,
    target:     null,
    required:   false,
    isPageBreak: true,
  }
}
