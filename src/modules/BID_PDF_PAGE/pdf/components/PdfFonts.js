import { Font } from '@react-pdf/renderer'

let registered = false

export function registerFonts() {
  if (registered) return
  registered = true

  // Абсолютный URL — воркер @react-pdf не понимает relative paths
  const base = window.location.origin

  Font.register({
    family: 'Montserrat',
    fonts: [
      { src: `${base}/fonts/Montserrat-Regular.ttf`,  fontWeight: 400 },
      { src: `${base}/fonts/Montserrat-SemiBold.ttf`, fontWeight: 600 },
      { src: `${base}/fonts/Montserrat-Bold.ttf`,     fontWeight: 700 },
      { src: `${base}/fonts/Montserrat-Medium.ttf`,   fontWeight: 500 },
      { src: `${base}/fonts/Montserrat-Italic.ttf`,   fontWeight: 400, fontStyle: 'italic' },
    ],
  })

  Font.registerHyphenationCallback(word => [word])
}
