// ─── SOMA PDF Engine Config ────────────────────────────────────────────────────
// Единый источник истины для всех PDF-компонентов.
// Меняем здесь — меняется везде.

// ─── Роли пользователей ───────────────────────────────────────────────────────
export const MANAGER_ROLE  = 1
export const ENGINEER_ROLE = 3  // TODO: поменять на 4 на продакшне

// ─── Единицы ─────────────────────────────────────────────────────────────────
// 1mm = 2.8346pt в @react-pdf/renderer
export const mm = (n) => n * 2.8346

// ─── Базовая сетка ────────────────────────────────────────────────────────────
// Все отступы кратны BASE_UNIT (2mm)
const U = mm(2)   // base unit

// ─── Конфиг ориентации ────────────────────────────────────────────────────────
const PORTRAIT = {
  size:        'A4',
  orientation: 'portrait',

  // Размеры страницы
  pageW:       mm(210),
  pageH:       mm(297),

  // Поля страницы
  marginTop:   mm(12),
  marginBottom:mm(22),
  marginLeft:  mm(12),
  marginRight: mm(12),

  // Рабочая область
  contentW:    mm(186),   // 210 - 12 - 12
  contentH:    mm(263),   // 297 - 12 - 22

  // Шапка и подвал
  headerH:     mm(10),
  footerH:     mm(8),

  // Верхний отступ контента
  paddingTop:    mm(12),
  paddingBottom: mm(22) + mm(8),

  // Фото-блоки
  imgMaxW:     mm(186),       // на всю ширину
  imgMaxH:     mm(120),       // половина страницы примерно
  imgHalfW:    mm(90),        // в две колонки (с зазором 6mm)
  imgColGap:   mm(6),

  // Таблицы
  tableColNumW:      mm(8),
  tableColQtyW:      mm(14),
  tableColPriceW:    mm(24),
  tableColTotalW:    mm(24),
  tableColPresenceW: mm(20),
  tableColPhotoW:    mm(35),

  // Акустика
  stiTextColW:       mm(72),  // ~42% от 170
  stiImgColW:        mm(92),  // ~54% от 170
}

const LANDSCAPE = {
  size:        'A4',
  orientation: 'landscape',

  pageW:       mm(297),
  pageH:       mm(210),

  marginTop:   mm(12),
  marginBottom:mm(22),
  marginLeft:  mm(12),
  marginRight: mm(12),

  contentW:    mm(273),   // 297 - 12 - 12
  contentH:    mm(176),   // 210 - 12 - 22

  headerH:     mm(10),
  footerH:     mm(8),

  paddingTop:    mm(12) + mm(10),
  paddingBottom: mm(22) + mm(8),

  imgMaxW:     mm(273),
  imgMaxH:     mm(100),
  imgHalfW:    mm(132),
  imgColGap:   mm(9),

  tableColNumW:      mm(8),
  tableColQtyW:      mm(16),
  tableColPriceW:    mm(28),
  tableColTotalW:    mm(28),
  tableColPresenceW: mm(22),
  tableColPhotoW:    mm(40),

  stiTextColW:       mm(114),  // ~42% от 273
  stiImgColW:        mm(150),  // ~55% от 273
}

export const LAYOUT = {
  v: PORTRAIT,
  h: LANDSCAPE,
}

// ─── Шрифты ───────────────────────────────────────────────────────────────────
export const FONTS = {
  regular:  'Montserrat',
  bold:     'Montserrat',
}

export const WEIGHT = {
  regular:   400,
  medium:    500,
  semibold:  600,
  bold:      700,
}

// ─── Размеры текста ───────────────────────────────────────────────────────────
export const TEXT = {
  xxs:  mm(2.4),   // метки, подсказки
  xs:   mm(2.8),   // мелкий текст, подписи рисунков
  sm:   mm(3.2),   // таблица, второстепенный текст
  base: mm(3.6),   // основной текст
  md:   mm(4.0),   // подзаголовки
  lg:   mm(5.0),   // заголовки секций
  xl:   mm(6.5),   // крупные заголовки
  xxl:  mm(9.0),   // обложка
}

// ─── Межстрочный интервал ─────────────────────────────────────────────────────
export const LINE = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.7,
}

// ─── Отступы ─────────────────────────────────────────────────────────────────
export const SPACE = {
  xxxs: mm(0.8), // микро-отступы
  xxs: U * 0.5,  // 1mm
  xs:  U,        // 2mm
  sm:  U * 1.5,  // 3mm
  md:  U * 2,    // 4mm
  lg:  U * 3,    // 6mm
  xl:  U * 5,    // 10mm
  xxl: U * 8,    // 16mm
  end: U * 3.6,
}

// ─── Радиусы ─────────────────────────────────────────────────────────────────
export const RADIUS = {
  sm: mm(1),
  md: mm(2),
  lg: mm(4),
}

// ─── Цвета компаний ───────────────────────────────────────────────────────────
const ARSTEL_COLORS = {
  // Бренд
  accent:         '#F47923',
  accentLight:    '#FF590322',
  accentMid:      '#FF590366',
  textPrimary:    '#1A1A1A',
  textSecondary:  '#3a3c41',
  textMuted:      '#767b85',
  textOnAccent:   '#FFFFFF',
  bgPage:         '#FFFFFF',
  bgSubtle:       '#F9FAFB',
  bgMuted:        '#F3F4F6',
  tableHeader:    '#4F5153',
  tableHeaderText:'#FFFFFF',
  tableRowEven:   '#E6E4E4',
  tableRowOdd:    '#f7f7f7',
  tableTotal:     '#c5c9cc',
  tableTotalText: '#FFFFFF',
  tableBorder:    '#E5E7EB',
  divider:        '#E5E7EB',
  dividerDark:    '#a5a8af',

  // Семантические цвета буллетов
  bulletCold:     '#dde8f4',   // приглушённый серо-голубой
  bulletWarn:     '#fdf0cc',   // тёплый кремово-жёлтый
  bulletDanger:   '#fce6e0',   // тёплый розово-красный
  dividerLight:   '#F3F4F6',
  sectionBar:     '#F47923',
}

const RONDO_COLORS = {
  accent:         '#269435',
  accentLight:    '#26943522',
  accentMid:      '#26943566',

  textPrimary:    '#1A1A1A',
  textSecondary:  '#3a3c41',
  textMuted:      '#767b85',
  textOnAccent:   '#FFFFFF',

  bgPage:         '#FFFFFF',
  bgSubtle:       '#F5F7F0',
  bgMuted:        '#EDEEE0',

  tableHeader:    '#8C7968',
  tableHeaderText:'#FFFFFF',
  tableRowEven:   '#EDEEE0',
  tableRowOdd:    '#FFFFFF',
  tableTotal:     '#289538',
  tableTotalText: '#FFFFFF',
  tableBorder:    '#D4D5C8',

  divider:        '#D4D5C8',
  dividerDark:    '#a5a8af',

  // Семантические цвета буллетов
  bulletCold:     '#d8e8f0',   // приглушённый зелёно-синий
  bulletWarn:     '#f5ecca',   // земляной тёплый жёлтый
  bulletDanger:   '#f5deda',   // приглушённый розовый
  dividerLight:   '#EDEEE0',

  sectionBar:     '#269435',
}

export const COLORS = {
  '2': ARSTEL_COLORS,
  '3': RONDO_COLORS,
}

// ─── Высота секций-обложек ────────────────────────────────────────────────────
export const COVER = {
  hatHeight:     mm(40.1), // = 210mm × (474/2481) — portrait pageW × соотношение ArstelHat
  fullRightColW: mm(70),   // правая колонка обложки
}

// ─── Геттер полного конфига ───────────────────────────────────────────────────
// Использование: const cfg = getConfig('2', 'v')
// cfg.color.accent, cfg.layout.contentW, cfg.text.base, cfg.space.md ...
export function getConfig(companyId = '2', orientation = 'v') {
  return {
    color:  COLORS[companyId]    ?? ARSTEL_COLORS,
    layout: LAYOUT[orientation]  ?? PORTRAIT,
    text:   TEXT,
    space:  SPACE,
    weight: WEIGHT,
    line:   LINE,
    radius: RADIUS,
    font:   FONTS,
    cover:  COVER,
  }
}
