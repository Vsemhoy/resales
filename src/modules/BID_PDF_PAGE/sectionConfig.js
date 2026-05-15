export const ALL_SECTIONS = [
  { key: 'cover',           label: 'Обложка',               draggable: false, target: null, required: false },
  { key: 'toc',             label: 'Оглавление',            draggable: false, target: null, required: false },
  { key: 'features',        label: 'Особенности системы',   draggable: true,  target: null, required: false },
  { key: 'selectEquipment', label: 'Выбор оборудования',    draggable: true,  target: null,  required: false },
  { key: 'acoustic',        label: 'Акустический расчёт',   draggable: true,  target: 'p',  required: false },
  { key: 'recommendations', label: 'Рекомендации',          draggable: true,  target: null, required: false },
  { key: 'specifications',  label: 'Спецификация',          draggable: true,  target: null, required: false },
  { key: 'specials',        label: 'Описание оборудования', draggable: true,  target: null, required: false },
  { key: 'rondoDelivery',   label: 'Условия поставки',      draggable: true,  target: null, required: false },
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

export const DEFAULT_SECTION_ORDER = ALL_SECTIONS.map(s => s.key)

export const DEFAULT_ENABLED = {
  cover:           true,
  toc:             true,
  features:        false,
  selectEquipment: false,
  acoustic:        false,
  recommendations: false,
  specifications:  true,
  specials:        false,
  rondoDelivery:   false,
}
