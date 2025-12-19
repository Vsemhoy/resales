import React from 'react';

const HighlightTextBreaker = ({ text, highlight, breakLines = false }) => {
  if (!text) {
    return <>{text}</>;
  }

  // Если нет подсветки, просто возвращаем текст
  if (!highlight || highlight.trim() === '') {
    return (
      <div style={{ 
        whiteSpace: breakLines ? 'pre-wrap' : 'nowrap',
        overflow: breakLines ? 'visible' : 'hidden',
        textOverflow: breakLines ? 'clip' : 'ellipsis'
      }}>
        {text}
      </div>
    );
  }

  // Экранируем спецсимволы в строке поиска
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  try {
    // Создаем регулярное выражение с флагом 'i' для регистронезависимости
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    
    // Разбиваем текст на части
    const parts = text.split(regex);

    return (
      <div style={{ 
        whiteSpace: breakLines ? 'pre-wrap' : 'nowrap',
        overflow: breakLines ? 'visible' : 'hidden',
        textOverflow: breakLines ? 'clip' : 'ellipsis',
        wordBreak: breakLines ? 'break-word' : 'normal',
      }}>
        {parts.map((part, index) => {
          // Проверяем, является ли часть совпадением (регистронезависимо)
          if (part.toLowerCase() === highlight.toLowerCase()) {
            return (
              <span key={index} className="sa-text-higlighted" style={{
                
                borderRadius: '2px',
                padding: '0 2px'
              }}>
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  } catch (error) {
    // Если регулярное выражение некорректное, возвращаем текст без подсветки
    console.error('Error creating regex for highlight:', error);
    return (
      <div style={{ 
        whiteSpace: breakLines ? 'pre-wrap' : 'nowrap',
        overflow: breakLines ? 'visible' : 'hidden',
        textOverflow: breakLines ? 'clip' : 'ellipsis'
      }}>
        {text}
      </div>
    );
  }
};

export default HighlightTextBreaker;