import { useEffect, useRef } from 'react';
import { Typography, Image } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HELP_CONTENT, HELP_SECTIONS } from './helpContent';

const { Title, Text } = Typography;

export default function HelpSectionContent({ sectionId, onSectionClick, onBlocksChange, activeBlockId }) {
  const section = HELP_SECTIONS.find((s) => s.id === sectionId);
  const items = HELP_CONTENT.filter((c) => c.sectionId === sectionId);

  // сообщаем наверх список блоков при смене секции
  useEffect(() => {
    onBlocksChange?.(items.map((item) => ({ id: item.id, title: item.title })));
  }, [sectionId]);

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
        <div
          key={item.id}
          id={item.id}
          className={['help-block', activeBlockId === item.id ? 'help-block--toc-active' : ''].join(' ')}
        >
          <Title level={4} className="help-block__title">
            {item.title}
          </Title>
          <HelpBlockContent content={item.content} onSectionClick={onSectionClick} />
        </div>
      ))}
    </div>
  );
}

function HelpBlockContent({ content, onSectionClick }) {
  if (!content || content.length === 0) return null;

  return (
    <>
      {content.map((piece, i) => {
        if (piece.type === 'text') {
          return (
            <div key={i} className="help-text-block">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{piece.text}</ReactMarkdown>
            </div>
          );
        }
        if (piece.type === 'images') {
          return <HelpImages key={i} images={piece.items} />;
        }
        if (piece.type === 'html') {
          return <div key={i} className="help-html-block" dangerouslySetInnerHTML={{ __html: piece.html }} />;
        }
        if (piece.type === 'section-table') {
          return <HelpSectionTable key={i} items={piece.items} onSectionClick={onSectionClick} />;
        }
        if (piece.type === 'section-links') {
          return <HelpSectionLinks key={i} items={piece.items} onSectionClick={onSectionClick} />;
        }
        return null;
      })}
    </>
  );
}

function HelpSectionLinks({ items, onSectionClick }) {
  return (
    <ul className="help-section-links">
      {items.map((item) => (
        <li key={item.id}>
          <button className="help-section-link" onClick={() => onSectionClick?.(item.id)}>
            {item.title}
          </button>
        </li>
      ))}
    </ul>
  );
}

function HelpSectionTable({ items, onSectionClick }) {
  return (
    <div className="help-section-table-wrap">
      <table className="help-section-table">
        <thead>
          <tr>
            <th>Раздел</th>
            <th>Обязательно</th>
            <th>Кто редактирует</th>
            <th>Назначение</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <button className="help-section-link" onClick={() => onSectionClick?.(item.id)}>
                  {item.title}
                </button>
              </td>
              <td>{item.required}</td>
              <td>{item.editor}</td>
              <td>{item.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HelpImages({ images }) {
  if (!images || images.length === 0) return null;
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
