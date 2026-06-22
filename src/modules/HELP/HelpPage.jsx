import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input, Typography, Badge } from 'antd';
import { SearchOutlined, CloseOutlined, LinkOutlined } from '@ant-design/icons';
import { HELP_SECTIONS, HELP_CONTENT } from './helpContent';
import HelpSectionContent from './HelpSectionContent';
import './HelpPage.css';

const { Text } = Typography;
const DEFAULT_SECTION_ID = HELP_SECTIONS[0].id;

const isKnownSection = (id) => HELP_SECTIONS.some((section) => section.id === id);

const getHelpItemText = (item) =>
  item.content
    ?.filter((piece) => piece.type === 'text')
    .map((piece) => piece.text)
    .join(' ') || '';

export default function HelpPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  const blockFromUrl = searchParams.get('block');

  const [activeSection, setActiveSection] = useState(() =>
    isKnownSection(sectionFromUrl) ? sectionFromUrl : DEFAULT_SECTION_ID
  );
  const [searchQuery, setSearchQuery] = useState('');

  // блоки текущей секции для TOC
  const [tocBlocks, setTocBlocks] = useState([]);
  // активный блок (следит IntersectionObserver)
  const [activeBlockId, setActiveBlockId] = useState(null);

  const contentRef = useRef(null);
  const observerRef = useRef(null);

  // ── IntersectionObserver для TOC ──────────────────────────────
  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect();

    const content = contentRef.current;
    if (!content) return;

    // небольшой debounce чтобы блоки успели отрендериться
    const tid = setTimeout(() => {
      const blocks = content.querySelectorAll('.help-block[id]');
      if (!blocks.length) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // берём самый верхний пересекающийся блок
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          if (visible.length > 0) {
            setActiveBlockId(visible[0].target.id);
          }
        },
        {
          root: content,
          // верхняя треть экрана — считаем "активной зоной"
          rootMargin: '-8% 0px -60% 0px',
          threshold: 0,
        }
      );

      blocks.forEach((b) => observerRef.current.observe(b));
    }, 80);

    return () => clearTimeout(tid);
  }, []);

  useEffect(() => {
    const cleanup = setupObserver();
    return () => {
      cleanup?.();
      observerRef.current?.disconnect();
    };
  }, [activeSection, tocBlocks, setupObserver]);

  // ── Скролл к якорю из URL (?block=...) ──────────────────────
  useEffect(() => {
    if (!blockFromUrl) return;
    const content = contentRef.current;
    if (!content) return;

    const tid = setTimeout(() => {
      const el = content.querySelector(`#${CSS.escape(blockFromUrl)}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActiveBlockId(blockFromUrl);
      }
    }, 120);

    return () => clearTimeout(tid);
  }, [blockFromUrl, activeSection]);

  const handleSectionClick = (id) => {
    if (!isKnownSection(id)) return;
    setSearchQuery('');
    setActiveSection(id);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('section', id);
      next.delete('block');
      return next;
    });
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTocClick = (blockId) => {
    const content = contentRef.current;
    if (!content) return;
    const el = content.querySelector(`#${CSS.escape(blockId)}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveBlockId(blockId);
    }
    // обновляем URL с якорем
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('section', activeSection);
      next.set('block', blockId);
      return next;
    });
  };

  const handleCopyBlockLink = (e, blockId) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('section', activeSection);
    url.searchParams.set('block', blockId);
    navigator.clipboard?.writeText(url.toString());
  };

  useEffect(() => {
    const nextSection = isKnownSection(sectionFromUrl) ? sectionFromUrl : DEFAULT_SECTION_ID;
    setActiveSection((current) => (current === nextSection ? current : nextSection));
  }, [sectionFromUrl]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
    setActiveBlockId(null);
  }, [activeSection]);

  // ── поиск ────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return HELP_CONTENT.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        getHelpItemText(item).toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const resultsBySectionId = useMemo(() => {
    if (!searchResults) return {};
    const map = {};
    searchResults.forEach((item) => {
      if (!map[item.sectionId]) map[item.sectionId] = [];
      map[item.sectionId].push(item);
    });
    return map;
  }, [searchResults]);

  const showToc = !searchQuery && tocBlocks.length > 1;

  return (
    <div className="help-page">
      {/* ── ЛЕВЫЙ САЙДБАР ── */}
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
            const isIndented = section.label.startsWith('—') || Boolean(section.parentId);
            const isNested = Boolean(section.parentId);

            return (
              <button
                key={section.id}
                className={[
                  'help-nav-item',
                  isActive ? 'help-nav-item--active' : '',
                  isIndented ? 'help-nav-item--sub' : '',
                  isNested ? 'help-nav-item--nested' : '',
                  searchQuery && hitCount === 0 ? 'help-nav-item--dim' : '',
                ].join(' ')}
                onClick={() => handleSectionClick(section.id)}
              >
                <span className="help-nav-item__label">
                  {section.label.replace(/^—\s*/, '')}
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
          <HelpSectionContent
            sectionId={activeSection}
            onSectionClick={handleSectionClick}
            onBlocksChange={setTocBlocks}
            activeBlockId={activeBlockId}
          />
        )}
      </main>

      {/* ── ПРАВЫЙ TOC ── */}
      {showToc && (
        <aside className="help-toc">
          <div className="help-toc__label">На этой странице</div>
          <nav className="help-toc__nav">
            {tocBlocks.map((block) => (
              <div
                key={block.id}
                className={['help-toc__item', activeBlockId === block.id ? 'help-toc__item--active' : ''].join(' ')}
              >
                <button
                  className="help-toc__link"
                  onClick={() => handleTocClick(block.id)}
                >
                  {block.title}
                </button>
                <button
                  className="help-toc__copy"
                  title="Скопировать ссылку на блок"
                  onClick={(e) => handleCopyBlockLink(e, block.id)}
                >
                  <LinkOutlined />
                </button>
              </div>
            ))}
          </nav>
        </aside>
      )}
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

  const snippet = useMemo(() => {
    const itemText = getHelpItemText(item);
    const q = query.trim().toLowerCase();
    const idx = itemText.toLowerCase().indexOf(q);
    if (idx === -1) return itemText.slice(0, 200) + '…';
    const start = Math.max(0, idx - 80);
    const end = Math.min(itemText.length, idx + 200);
    return (start > 0 ? '…' : '') + itemText.slice(start, end) + (end < itemText.length ? '…' : '');
  }, [item, query]);

  return (
    <div className="help-search-item">
      <div className="help-search-item__title">{highlight(item.title)}</div>
      <div className="help-search-item__snippet">{highlight(snippet)}</div>
    </div>
  );
}
