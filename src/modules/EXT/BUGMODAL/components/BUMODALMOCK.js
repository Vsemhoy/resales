import dayjs from 'dayjs';
import { useMemo } from 'react';

// Кастомный хук для генерации случайных строк
export function useRandomStringGenerator(length = 333, lang = 'en') {
  return useMemo(() => {
    // Вспомогательная функция для генерации случайного целого числа
    const randInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
    
    // Конфигурация в зависимости от языка
    const config = {
      en: {
        CHARS: "eatoinhsrdlwmguycfpbkvxjzq",
        VOWELS: "eaoiuy",
        CONSONANTS: "tinhsrdlwmgcfpbkvxjzq",
        CAPCHARS: 'EATOINHSRDLWMGUYCFPBKVXJZQ',
        GAPS: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", ", ", ", ", ", ", ", ", ", ", ", ", ", ", " - ", "'", ": ", "; ", " — " ],
        CAPGAPS: [".", ".", ".", ".",".", ".",".", ".", ".", ".", ".", "?", "!", "!?", "..." ]
      },
      ru: {
        CHARS: "оиенатсрлвкмпыдуягйьзхчшжбюфцщэ",
        VOWELS: "оиеаыуяйьюэ",
        CONSONANTS: "нтсрлвкмпдгзьчшжбфцщ",
        CAPCHARS: 'ОИЕНАТСРЛВКМПЫДУЯГЙЬЗХЧШЖБЮФЦЩЭ',
        GAPS: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", ", ", ", ", ", ", ", ", ", ", ", ", ", ", " - ", "'", ": ", "; ", " — " ],
        CAPGAPS: [".", ".", ".", ".",".", ".",".", ".", ".", ".", ".", "?", "!", "!?", "..." ]
      }
    };
    
    const { CHARS, VOWELS, CONSONANTS, CAPCHARS, GAPS, CAPGAPS } = config[lang] || config.en;
    
    // Основная функция генерации
    const generateRandomString = (len) => {
      const charLen = CHARS.length;
      const capsCharLen = CAPCHARS.length;
      let randomstring = '';
      let maincounter = 0;
      let lettercounter = 0;
      let entercounter = 0;
      
      let lastCharAfter = '';
      let vc_position = 0;
      let startcounter = 0;
      let wordcounts = 0;
      let entercounts = 0;
      
      for (let i = 0; i < len; i++) {
        if (maincounter === 0) {
          wordcounts = randInt(19, 73);
        }
        
        if (entercounter === 0) {
          entercounts = randInt(3, 13);
        }
        
        // Генерация букв в слове
        const wordLength = randInt(1, 12);
        for (let i2 = 0; i2 < wordLength; i2++) {
          if (((maincounter === 1) && (lettercounter === 0)) || !startcounter) {
            startcounter++;
            // Начинаем слово с заглавной буквы
            randomstring += CAPCHARS[randInt(0, capsCharLen - 1)];
            lettercounter++;
          } else {
            // Чередуем гласные и согласные
            let characters, currentCharLen;
            if (vc_position === 0) {
              characters = VOWELS;
              currentCharLen = VOWELS.length;
              vc_position = 1;
            } else {
              characters = CONSONANTS;
              currentCharLen = CONSONANTS.length;
              vc_position = 0;
            }
            
            // Проверяем, чтобы не было двух одинаковых букв подряд
            let lastCharBefore;
            do {
              lastCharBefore = characters[randInt(0, currentCharLen - 1)];
            } while (lastCharBefore === lastCharAfter);
            
            randomstring += lastCharBefore;
            lastCharAfter = lastCharBefore;
            lettercounter++;
          }
        }
        
        // Добавляем разделители между словами
        if (maincounter === wordcounts) {
          const capitalpoint = CAPGAPS[randInt(0, CAPGAPS.length - 1)];
          randomstring += capitalpoint + "<br>";
          maincounter = 0;
          lettercounter = 0;
          entercounter++;
          
          if (entercounter === entercounts) {
            randomstring += "<br>";
            entercounter = 0;
          }
        } else {
          const gap = GAPS[randInt(0, GAPS.length - 1)];
          randomstring += gap;
        }
        
        maincounter++;
      }
      
      return randomstring.trim() + "...";
    };
    
    return generateRandomString(length);
  }, [length, lang]);
}

// Альтернативный вариант: компонент для отображения
export function RandomString({ length = 333, lang = 'en', className = '' }) {
  const randomString = useRandomStringGenerator(length, lang);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: randomString }}
    />
  );
}

// Упрощенный вариант: функция для прямого вызова
export function generateRandomString(length = 333, lang = 'en') {
  const randInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
  
  const config = {
    en: {
      VOWELS: "eaoiuy",
      CONSONANTS: "tinhsrdlwmgcfpbkvxjzq",
      CAPCHARS: 'EATOINHSRDLWMGUYCFPBKVXJZQ',
      GAPS: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", ", ", ", ", ", ", ", ", ", ", ", ", ", ", " - ", "'", ": ", "; ", " — " ],
      CAPGAPS: [".", ".", ".", ".",".", ".",".", ".", ".", ".", ".", "?", "!", "!?", "..." ]
    },
    ru: {
      VOWELS: "оиеаыуяйьюэ",
      CONSONANTS: "нтсрлвкмпдгзьчшжбфцщ",
      CAPCHARS: 'ОИЕНАТСРЛВКМПЫДУЯГЙЬЗХЧШЖБЮФЦЩЭ',
      GAPS: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", ", ", ", ", ", ", ", ", ", ", ", ", ", ", " - ", "'", ": ", "; ", " — " ],
      CAPGAPS: [".", ".", ".", ".",".", ".",".", ".", ".", ".", ".", "?", "!", "!?", "..." ]
    }
  };
  
  const { VOWELS, CONSONANTS, CAPCHARS, GAPS, CAPGAPS } = config[lang] || config.en;
  
  let result = '';
  let wordCounter = 0;
  let vcPosition = 0;
  let lastChar = '';
  let sentenceLength = randInt(19, 73);
  let paragraphCounter = 0;
  let paragraphLength = randInt(3, 13);
  
  for (let i = 0; i < length; i++) {
    // Начало нового предложения
    if (wordCounter === 0) {
      sentenceLength = randInt(19, 73);
      result += CAPCHARS[randInt(0, CAPCHARS.length - 1)];
      vcPosition = 1; // Начинаем с согласной после заглавной
    } else {
      // Генерируем слово
      const wordLength = randInt(1, 12);
      for (let j = 0; j < wordLength; j++) {
        const charset = vcPosition === 0 ? VOWELS : CONSONANTS;
        let char;
        
        do {
          char = charset[randInt(0, charset.length - 1)];
        } while (char === lastChar);
        
        result += char;
        lastChar = char;
        vcPosition = vcPosition === 0 ? 1 : 0; // Чередуем гласные/согласные
      }
    }
    
    wordCounter++;
    
    // Конец предложения или продолжение
    if (wordCounter >= sentenceLength) {
      result += CAPGAPS[randInt(0, CAPGAPS.length - 1)] + "<br>";
      paragraphCounter++;
      wordCounter = 0;
      vcPosition = 0;
      
      if (paragraphCounter >= paragraphLength) {
        result += "<br>";
        paragraphCounter = 0;
        paragraphLength = randInt(3, 13);
      }
    } else {
      result += GAPS[randInt(0, GAPS.length - 1)];
    }
  }
  
  return result.trim() + "...";
}


function ucwords(str) {
  if (!str) return '';
  
  return str
    .toLowerCase() // сначала приводим к нижнему регистру
    .split(' ') // разбиваем по пробелам
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}


export const BUMMODALMOCK = () => {
  let result = [];

  for (let i = 0; i < 50; i++) {
    // Генерируем случайные строки
    const nameLength = Math.floor(Math.random() * 5) + 5; // Длина имени от 5 до 10
    const contentLength = Math.floor(Math.random() * 50) + 30; // Длина контента от 30 до 80
    
    // Используем вспомогательную функцию для генерации строк (не React хук)
    const name = ucwords(generateRandomString(nameLength));
    const content = generateRandomString(contentLength);
    
    let ans = {
      id: i + 1,
      username: name,
      user_id: 243,
      content: content,
      created_at: dayjs().format('YYYY-MM-DD'),
      finished_at: "2023-12-13",
      status: Math.floor(Math.random() * 4) + 1 // Статус от 1 до 4
    };
    result.push(ans);
  }
  return result;
};
