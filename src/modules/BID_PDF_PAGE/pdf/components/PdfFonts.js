import { Font } from '@react-pdf/renderer'

let registered = false

export function registerFonts() {
  if (registered) return
  registered = true

  console.log('REGISTER')
  // Шрифты из public/fonts/ — путь зависит от того где лежат в проекте
  // Если недоступны локально — падаем на системный Helvetica (встроен в @react-pdf)
  try {
    console.log('PRE')
    Font.register({
      family: 'Montserrat',
      fonts: [
        // { src: '/fonts/Montserrat-Medium.ttf',     fontWeight: 500 },
        // { src: '/fonts/Montserrat-Italic.ttf',     fontWeight: 400, fontStyle: 'italic' },
        { src: '/fonts/Montserrat-Regular.ttf',    fontWeight: 400 },
        { src: '/fonts/Montserrat-SemiBold.ttf',   fontWeight: 600 },
        { src: '/fonts/Montserrat-Bold.ttf',       fontWeight: 700 },
      ],
    })

    console.log('TRY')
  } catch (e) {
    console.warn('Montserrat not found, using Helvetica fallback')
  }
  console.log('Fonts loaded');
  Font.registerHyphenationCallback(word => [word]) // без переносов
}
