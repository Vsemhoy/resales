import { mm } from './units'

export const rondoTheme = {
  accent:       '#269435',
  black:        '#1A1A1A',
  gray:         '#6B7280',
  grayLight:    '#EDEEE0',
  border:       '#D4D5C8',
  white:        '#FFFFFF',

  tableHeader:  '#8C7968',
  tableRowEven: '#EDEEE0',
  tableTotal:   '#289538',

  page: {
    size:        'A4',
    orientation: 'portrait',
    marginTop:    mm(20),
    marginBottom: mm(24),
    marginLeft:   mm(20),
    marginRight:  mm(20),
  },

  header: { height: mm(12) },
  footer: { height: mm(14) },

  fonts: {
    regular: 'Montserrat',
    bold:    'Montserrat',
  },

  fontSize: {
    xs:   mm(2.8),
    sm:   mm(3.2),
    base: mm(3.6),
    md:   mm(4),
    lg:   mm(5),
    xl:   mm(6),
    xxl:  mm(8),
  },
}
