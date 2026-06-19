import { Typography, Image } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HELP_CONTENT, HELP_SECTIONS } from './helpContent';

const { Title, Text } = Typography;

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
          <HelpBlockContent content={item.content} />
        </div>
      ))}
    </div>
  );
}

/**
 * Рендерит content[] блока — упорядоченную последовательность
 * текстовых и графических кусков в любом количестве и порядке.
 */
function HelpBlockContent({ content }) {
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
        return null;
      })}
    </>
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
