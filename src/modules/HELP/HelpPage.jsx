import { useState, useMemo, useRef, useEffect } from 'react';
import { Input, Typography, Badge } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { HELP_SECTIONS, HELP_CONTENT } from './helpContent';
import HelpSectionContent from './HelpSectionContent';
import './HelpPage.css';

const { Text } = Typography;

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState(HELP_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return HELP_CONTENT.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // группируем результаты по секции
  const resultsBySectionId = useMemo(() => {
    if (!searchResults) return {};
    const map = {};
    searchResults.forEach((item) => {
      if (!map[item.sectionId]) map[item.sectionId] = [];
      map[item.sectionId].push(item);
    });
    return map;
  }, [searchResults]);

  const handleSectionClick = (id) => {
    setSearchQuery('');
    setActiveSection(id);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // при смене секции скроллим в топ
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  return (
    <div className="help-page">
      {/* ── САЙДБАР ── */}
      <aside className="help-sidebar">
        <div className="help-sidebar__search">
          <Input
            prefix={<SearchOutlined />}
            suffix={
              searchQuery ? (
                <CloseOutlined
                  className="help-sidebar__clear"
                  onClick={() => setSearchQuery('')}
                />
              ) : null
            }
            placeholder="Поиск по справке..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear={false}
          />
        </div>

        <nav className="help-sidebar__nav">
          {HELP_SECTIONS.map((section) => {
            const hitCount = searchResults
              ? (resultsBySectionId[section.id] || []).length
              : 0;
            const isActive = !searchQuery && activeSection === section.id;
            const isIndented = section.label.startsWith('—');

            return (
              <button
                key={section.id}
                className={[
                  'help-nav-item',
                  isActive ? 'help-nav-item--active' : '',
                  isIndented ? 'help-nav-item--sub' : '',
                  searchQuery && hitCount === 0 ? 'help-nav-item--dim' : '',
                ].join(' ')}
                onClick={() => handleSectionClick(section.id)}
              >
                <span className="help-nav-item__label">
                  {isIndented ? section.label.slice(2) : section.label}
                </span>
                {searchQuery && hitCount > 0 && (
                  <Badge count={hitCount} size="small" color="#1677ff" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── КОНТЕНТ ── */}
      <main className="help-content" ref={contentRef}>
        {searchQuery ? (
          <SearchResults
            query={searchQuery}
            results={searchResults}
            onSectionClick={handleSectionClick}
          />
        ) : (
          <HelpSectionContent sectionId={activeSection} />
        )}
      </main>
    </div>
  );
}

function SearchResults({ query, results, onSectionClick }) {
  if (results.length === 0) {
    return (
      <div className="help-empty">
        <Text type="secondary">Ничего не найдено по запросу «{query}»</Text>
      </div>
    );
  }

  // группируем по секции
  const grouped = {};
  results.forEach((item) => {
    if (!grouped[item.sectionId]) grouped[item.sectionId] = [];
    grouped[item.sectionId].push(item);
  });

  const sectionLabel = (id) =>
    HELP_SECTIONS.find((s) => s.id === id)?.label?.replace(/^—\s*/, '') || id;

  return (
    <div className="help-search-results">
      <div className="help-search-results__header">
        <Text type="secondary">
          Найдено {results.length} результат{results.length === 1 ? '' : results.length < 5 ? 'а' : 'ов'} по запросу «{query}»
        </Text>
      </div>
      {Object.entries(grouped).map(([sectionId, items]) => (
        <div key={sectionId} className="help-search-group">
          <button
            className="help-search-group__title"
            onClick={() => onSectionClick(sectionId)}
          >
            {sectionLabel(sectionId)}
          </button>
          {items.map((item) => (
            <SearchResultItem key={item.id} item={item} query={query} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SearchResultItem({ item, query }) {
  const highlight = (text) => {
    const q = query.trim();
    if (!q) return text;
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(re);
    return parts.map((part, i) =>
      re.test(part) ? (
        <mark key={i} className="help-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // показываем только часть текста вокруг найденного слова
  const snippet = useMemo(() => {
    const q = query.trim().toLowerCase();
    const idx = item.text.toLowerCase().indexOf(q);
    if (idx === -1) return item.text.slice(0, 200) + '…';
    const start = Math.max(0, idx - 80);
    const end = Math.min(item.text.length, idx + 200);
    return (start > 0 ? '…' : '') + item.text.slice(start, end) + (end < item.text.length ? '…' : '');
  }, [item.text, query]);

  return (
    <div className="help-search-item">
      <div className="help-search-item__title">{highlight(item.title)}</div>
      <div className="help-search-item__snippet">{highlight(snippet)}</div>
    </div>
  );
}
