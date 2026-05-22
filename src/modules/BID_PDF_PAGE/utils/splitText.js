// Разбивает текст на части по количеству слов
// firstPageLimit — слова для первой страницы (обычно меньше из-за заголовка)
// nextPagesLimit — слова для последующих страниц
export function splitTextByWords(text, firstPageLimit = 300, nextPagesLimit = 360) {
  if (!text || typeof text !== 'string') return [{ text: '', isLast: true }]

  // Нормализуем переносы строк — заменяем их на пробелы
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, ' ')
  
  // Разбиваем на слова
  const words = normalizedText.split(/\s+/).filter(w => w.length > 0)
  
  if (words.length <= firstPageLimit) {
    return [{ text: normalizedText, isLast: true }]
  }

  const result = []
  let currentIndex = 0

  // Первая страница
  const firstChunk = words.slice(0, firstPageLimit).join(' ')
  result.push({ text: firstChunk, isLast: false })
  currentIndex += firstPageLimit

  // Последующие страницы
  while (currentIndex < words.length) {
    const nextEnd = Math.min(currentIndex + nextPagesLimit, words.length)
    const chunk = words.slice(currentIndex, nextEnd).join(' ')
    
    result.push({
      text: chunk,
      isLast: nextEnd >= words.length,
    })
    
    currentIndex = nextEnd
  }

  return result
}

// Альтернативная версия — разбивание по символам (более точное)
export function splitTextByChars(text, firstPageLimit = 1500, nextPagesLimit = 2000) {
  if (!text || typeof text !== 'string') return [{ text: '', isLast: true }]

  if (text.length <= firstPageLimit) {
    return [{ text, isLast: true }]
  }

  const result = []
  let currentIndex = 0

  // Первая страница
  const firstChunk = text.slice(0, firstPageLimit)
  result.push({ text: firstChunk, isLast: false })
  currentIndex += firstPageLimit

  // Последующие страницы
  while (currentIndex < text.length) {
    const nextEnd = Math.min(currentIndex + nextPagesLimit, text.length)
    const chunk = text.slice(currentIndex, nextEnd)
    
    result.push({
      text: chunk,
      isLast: nextEnd >= text.length,
    })
    
    currentIndex = nextEnd
  }

  return result
}




/**
 * Умный перенос одного сегмента текста (без учёта принудительных \n)
 * так, чтобы в каждой строке было не более maxWidth символов
 * и слова не разрывались.
 *
 * @param {string} segment  – кусок текста без внутренних \n
 * @param {number} maxWidth – максимальное число символов в строке
 * @returns {string[]}      массив готовых строк
 */


/**
 * Основная функция – разбивает исходный текст на страницы,
 * где каждая страница содержит две колонки.
 *
 * @param {string} text               исходный текст (может содержать \n)
 * @param {number} maxCharsPerLine    макс. длина строки (в твоём случае 50)
 * @param {number} linesFirstPage     сколько строк в колонке первой страницы (18)
 * @param {number} linesOtherPages    сколько строк в колонке остальных страниц (22)
 * @returns {Array<{page:number, text:{first:string,second:string}}>}
 */

export function splitTextPreservingLineBreaks(text, limitPerPart = 40) {
  if (!text || typeof text !== 'string') return [{ text: '', isLast: true }];

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const paragraphs = normalized.split(/\n\s*\n/).filter(p => p.trim());
  
  if (paragraphs.length <= limitPerPart) {
    return [{ text: normalized, isLast: true }];
  }

  const result = [];
  let currentParagraphs = [];

  for (const para of paragraphs) {
    if (currentParagraphs.length >= limitPerPart) {
      result.push({
        text: currentParagraphs.join('\n\n'),
        isLast: false,
      });
      currentParagraphs = [para];
    } else {
      currentParagraphs.push(para);
    }
  }

  if (currentParagraphs.length > 0) {
    result.push({
      text: currentParagraphs.join('\n\n'),
      isLast: true,
    });
  }

  return result;
}






// Добавление неразнывных пробелов после предлогов
export function applyNonBreakingSpaces(text) {
  if (!text) return text;

  return text.replace(
    /(^|\s)(а|у|на|в|от|для|и|с|по|о|к|из|за|до|без|под|75|60|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1|0)\s+(\S+)/gi,
    (_, before, shortWord, nextWord) =>
      `${before}${shortWord}\u00A0${nextWord}`
  );
}


const NON_BREAKING_WORDS = new Set([
  "а", "у", "на", "в", "от", "для", "и",
  "с", "по", "о", "к", "из", "за", "до", "без", "под"
]);

function isNumberToken(token) {
  return /^\d+$/.test(token);
}

function isShortWordToken(token) {
  return NON_BREAKING_WORDS.has(token.toLowerCase());
}

export function applyNonBreakingSpacesPro(text) {
  if (!text) return text;

  const parts = String(text).split(/(\s+)/); 
  // сохраняем пробелы как элементы массива

  const result = [];

  for (let i = 0; i < parts.length; i++) {
    const current = parts[i];

    // если это не слово, просто кидаем как есть
    if (!current || /^\s+$/.test(current)) {
      result.push(current);
      continue;
    }

    const nextSpace = parts[i + 1];
    const nextWord = parts[i + 2];

    const canBind =
      nextSpace &&
      /^\s+$/.test(nextSpace) &&
      nextWord &&
      !/^\s+$/.test(nextWord) &&
      (isShortWordToken(current) || isNumberToken(current));

    if (canBind) {
      result.push(current + "\u00A0" + nextWord);
      i += 2; // пропускаем пробел и следующее слово
    } else {
      result.push(current);
    }
  }

  return result.join("");
}






function wrapSegment(segment, maxWidth) {
  if (segment === "") return [""];

  const words = segment.trim().split(/\s+/);
  const lines = [];
  let cur = "";

  for (const w of words) {
    const add = cur ? ` ${w}` : w;

    if (cur.length + add.length <= maxWidth) {
      cur += add;
      continue;
    }

    const parts = cur.split(" ");
    const lastWord = parts[parts.length - 1]?.toLowerCase();

    if (parts.length > 1 && NON_BREAKING_WORDS.has(lastWord)) {
      const lineWithoutLast = parts.slice(0, -1).join(" ");
      const movedToNext = `${parts[parts.length - 1]} ${w}`;

      if (lineWithoutLast) {
        lines.push(lineWithoutLast);
        cur = movedToNext;
      } else {
        if (cur) lines.push(cur);
        cur = w;
      }
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }

  if (cur !== "") lines.push(cur);

  return lines;
}



function wrapSegmentToLines(segment, maxWidth) {
  if (segment === "") return [""];

  const words = segment.trim().split(/\s+/);
  const lines = [];
  let cur = "";

  for (const w of words) {
    const add = cur ? ` ${w}` : w;

    if (cur.length + add.length <= maxWidth) {
      cur += add;
      continue;
    }

    const parts = cur.split(" ");
    const lastWord = parts[parts.length - 1]?.toLowerCase();

    if (parts.length > 1 && NON_BREAKING_WORDS.has(lastWord)) {
      const lineWithoutLast = parts.slice(0, -1).join(" ");
      const movedToNext = `${parts[parts.length - 1]} ${w}`;

      if (lineWithoutLast) {
        lines.push(lineWithoutLast);
        cur = movedToNext;
      } else {
        if (cur) lines.push(cur);
        cur = w;
      }
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }

  if (cur !== "") lines.push(cur);

  return lines;
}

export function wrapTextPreserveBreaks(text, maxWidth) {
  if (text == null || text === "") return "";

  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map(line => {
      if (line.trim() === "") return "";
      return wrapSegmentToLines(line, maxWidth).join("\n");
    })
    .join("\n");
}


function joinLinesAsParagraphs(lines) {
  const paragraphs = [];
  let current = [];

  for (const line of lines) {
    // пустая строка = новый абзац
    if (line === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    paragraphs.push(current.join(" "));
  }

  // между абзацами сохраняем перенос
  return paragraphs.join("\n");
}

export function paginateTwoColumns(
  text,
  maxCharsPerLine,
  linesFirstPage,
  linesOtherPages
) {
  const normalized = (text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '\n\n')

  const wrappedText = wrapTextPreserveBreaks(normalized, maxCharsPerLine);
  const logicalLines = wrappedText.split("\n");

  const pages = [];
  let linePtr = 0;
  let pageNum = 1;

  while (linePtr < logicalLines.length) {
    const linesInCol =
      pageNum === 1 ? linesFirstPage : linesOtherPages;

    const firstLines = logicalLines.slice(linePtr, linePtr + linesInCol);
    linePtr += firstLines.length;

    const secondLines = logicalLines.slice(
      linePtr,
      linePtr + linesInCol
    );
    linePtr += secondLines.length;

    pages.push({
      page: pageNum,
      text: {
        first: joinLinesAsParagraphs(firstLines),
        second: joinLinesAsParagraphs(secondLines),
      }
    });

    pageNum++;
  }

  return pages;
}


  export function paginateTwoColumnsRondo(
    text,
    maxCharsPerLine,
    linesFirstPage,
    linesOtherPages
  ) {
    // Нормализуем переносы: любой \n → \n\n, чтобы каждый абзац
    // стал отдельной строкой с пустым разделителем между ними.
    // Это нужно потому что joinLinesAsParagraphs определяет границы
    // абзацев только по пустым строкам, а текст из textarea приходит
    // с одиночными \n.
    const normalized = (text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n+/g, '\n\n')  // любое кол-во \n → ровно два

    const wrappedText  = wrapTextPreserveBreaks(normalized, maxCharsPerLine)
    const logicalLines = wrappedText.split('\n')

    const pages = []
    let linePtr = 0
    let pageNum = 1

    while (linePtr < logicalLines.length) {
      const totalLines = pageNum === 1 ? linesFirstPage : linesOtherPages
      const leftCount  = Math.ceil(totalLines * 0.63)   // 60% — левая
      const rightCount = totalLines - leftCount         // 40% — правая

      const firstLines  = logicalLines.slice(linePtr, linePtr + leftCount)
      linePtr += firstLines.length

      const secondLines = logicalLines.slice(linePtr, linePtr + rightCount)
      linePtr += secondLines.length

      pages.push({
        page: pageNum,
        text: {
          first:  joinLinesAsParagraphs(firstLines),
          second: joinLinesAsParagraphs(secondLines),
        }
      })

      pageNum++
    }

    return pages
  }


export function cleanAlphaNumeric(text) {
  if (!text) return "";

  return text.replace(/[^a-zA-Zа-яА-ЯёЁ0-9]/g, "");
}

// ─── Высотная пагинация рекомендаций ─────────────────────────────────────────
//
// Геометрия Рондо (альбомный A4, 210мм):
//   header: 14мм  footer: 24мм  paddingTop: 4мм  tableHeader: 11мм
//   titleRow (только стр.1): ~26мм
//   ─────────────────────────────────────────────────────────────
//   Доступно под строки:
//     первая страница : 210 - 14 - 24 - 4 - 26 - 11 = 131мм
//     следующие стр.  : 210 - 14 - 24 - 4      - 11 = 157мм
//
// Высота строки:
//   базовая  : 18мм  (ROW_H + padding)
//   extra    :  4.5мм за каждую дополнительную строку текста
//   ширина desc-колонки ~50 симв., note-колонки ~49 симв.

const REC_CHARS_DESC       = 50   // символов в строке колонки «Наименование»
const REC_CHARS_NOTE       = 49   // символов в строке колонки «Примечание»
const REC_ROW_BASE_H       = 18   // мм — базовая высота строки (1 строка текста)
const REC_EXTRA_LINE_H     = 4.5  // мм — каждая дополнительная строка
const REC_FIRST_PAGE_H     = 131  // мм
const REC_NEXT_PAGE_H      = 157  // мм

function recRowHeightMm(item) {
  const descText = [
    item['recommendation-model'] || '',
    item['recommendation-text']  || '',
  ].join(' ')
  const noteText = item['recommendation-note'] || ''

  const descLines = Math.ceil(descText.length / REC_CHARS_DESC) || 1
  const noteLines = Math.ceil(noteText.length / REC_CHARS_NOTE) || 1
  const maxLines  = Math.max(descLines, noteLines)

  return REC_ROW_BASE_H + Math.max(0, maxLines - 1) * REC_EXTRA_LINE_H
}

export function paginateRecommendationsByHeight(items) {
  const chunks = []
  let currentChunk = []
  let usedMm = 0
  let maxMm  = REC_FIRST_PAGE_H

  for (const item of items) {
    const h = recRowHeightMm(item)
    if (currentChunk.length > 0 && usedMm + h > maxMm) {
      chunks.push(currentChunk)
      currentChunk = []
      usedMm = 0
      maxMm  = REC_NEXT_PAGE_H
    }
    currentChunk.push(item)
    usedMm += h
  }
  if (currentChunk.length > 0) chunks.push(currentChunk)
  return chunks
}