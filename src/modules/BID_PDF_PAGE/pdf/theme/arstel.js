// Обёртка для обратной совместимости — новый код использует getConfig()
import { getConfig, mm } from '../pdf_config'

const cfg = getConfig('2', 'v')

export const arstelTheme = {
  accent:       cfg.color.accent,
  black:        cfg.color.textPrimary,
  gray:         cfg.color.textSecondary,
  grayLight:    cfg.color.bgMuted,
  border:       cfg.color.divider,
  white:        cfg.color.bgPage,

  tableHeader:  cfg.color.tableHeader,
  tableRowEven: cfg.color.tableRowEven,
  tableTotal:   cfg.color.tableTotal,

  page: {
    size:         cfg.layout.size,
    orientation:  cfg.layout.orientation,
    marginTop:    cfg.layout.marginTop,
    marginBottom: cfg.layout.marginBottom,
    marginLeft:   cfg.layout.marginLeft,
    marginRight:  cfg.layout.marginRight,
  },

  header: { height: cfg.layout.headerH },
  footer: { height: cfg.layout.footerH },

  fonts: { regular: cfg.font.regular, bold: cfg.font.bold },

  fontSize: {
    xs:   cfg.text.xs,
    sm:   cfg.text.sm,
    base: cfg.text.base,
    md:   cfg.text.md,
    lg:   cfg.text.lg,
    xl:   cfg.text.xl,
    xxl:  cfg.text.xxl,
  },
}
