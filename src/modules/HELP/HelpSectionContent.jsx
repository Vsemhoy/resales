import { useState } from 'react';
import { Typography, Image } from 'antd';
import { HELP_CONTENT, HELP_SECTIONS } from './helpContent';

const { Title, Paragraph, Text } = Typography;

export default function HelpSectionContent({ sectionId }) {
  const section = HELP_SECTIONS.find((s) => s.id === sectionId);
  const items = HELP_CONTENT.filter((c) => c.sectionId === sectionId);

  if (!section || items.length === 0) {
    return (
      <div className="help-empty">
        <Text type="secondary">Раздел пуст</Text>
      </div>
    );
  }

  const sectionLabel = section.label.replace(/^—\s*/, '');

  return (
    <div className="help-section-content">
      <Title level={2} className="help-section-content__title">
        {sectionLabel}
      </Title>

      {items.map((item) => (
        <div key={item.id} className="help-block">
          <Title level={4} className="help-block__title">
            {item.title}
          </Title>
          <TextBlock text={item.text} />
          {item.images && item.images.length > 0 && (
            <HelpImages images={item.images} />
          )}
        </div>
      ))}
    </div>
  );
}

function HelpImages({ images }) {
  return (
    <div className="help-images">
      <Image.PreviewGroup>
        {images.map((img, i) => (
          <figure key={i} className="help-figure">
            <Image
              src={img.src}
              alt={img.caption}
              className="help-figure__img"
              preview={{ mask: 'Увеличить' }}
            />
            {img.caption && (
              <figcaption className="help-figure__caption">{img.caption}</figcaption>
            )}
          </figure>
        ))}
      </Image.PreviewGroup>
    </div>
  );
}

/**
 * Рендерит текст с поддержкой:
 * - Нумерованных списков (строки вида "1. ...")
 * - Маркированных списков (строки вида "- ...")
 * - Обычных абзацев
 */
function TextBlock({ text }) {
  const lines = text.split('\n').map((l) => l.trimEnd());

  const result = [];
  let buffer = [];
  let listType = null; // 'ul' | 'ol' | null

  const flushList = () => {
    if (!buffer.length) return;
    if (listType === 'ol') {
      result.push(
        <ol key={result.length} className="help-list">
          {buffer.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    } else {
      result.push(
        <ul key={result.length} className="help-list">
          {buffer.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    buffer = [];
    listType = null;
  };

  lines.forEach((line, idx) => {
    if (!line) {
      flushList();
      return;
    }

    const olMatch = line.match(/^(\d+)\.\s+(.+)/);
    const ulMatch = line.match(/^[-●•]\s+(.+)/);

    if (olMatch) {
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      buffer.push(olMatch[2]);
    } else if (ulMatch) {
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      buffer.push(ulMatch[1]);
    } else {
      flushList();
      result.push(
        <Paragraph key={idx} className="help-paragraph">
          {line}
        </Paragraph>
      );
    }
  });

  flushList();

  return <div className="help-text-block">{result}</div>;
}
