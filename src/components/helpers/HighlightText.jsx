import React from 'react';

const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) {
    return <>{text}</>;
  }

  // Экранируем спецсимволы в строке поиска
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Разбиваем текст на части: до, совпадение, после (и так далее)
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={index} className={'sa-text-higlighted'}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

export default HighlightText;