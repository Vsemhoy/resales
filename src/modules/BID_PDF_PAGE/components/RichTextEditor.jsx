import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import TextAlign  from '@tiptap/extension-text-align'
import classes from './RichTextEditor.module.css'

// ─── RichTextEditor ───────────────────────────────────────────────────────────
// Пропы:
//   value    — HTML строка (хранится в form_data)
//   onChange — колбэк(html: string)
//   accent   — цвет акцента темы (для кнопки цвета), по умолчанию #FF5903
//   placeholder — текст-заглушка

export function RichTextEditor({ value, onChange, accent = '#FF5903', placeholder = 'Введите текст...' }) {
  const [rawMode, setRawMode] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: classes.editorContent,
      },
    },
  })

  // Синхронизируем если value изменился снаружи (напр. при загрузке драфта)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className={classes.wrap}>
      <Toolbar editor={editor} accent={accent} rawMode={rawMode} onToggleRaw={() => setRawMode(r => !r)} />

      {rawMode ? (
        <textarea
          className={classes.rawTextarea}
          value={value || ''}
          onChange={e => {
            onChange?.(e.target.value)
            editor.commands.setContent(e.target.value, false)
          }}
          spellCheck={false}
        />
      ) : (
        <>
          <EditorContent editor={editor} className={classes.editorWrap} />
          {!editor.getText() && (
            <div className={classes.placeholder}>{placeholder}</div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Тулбар ───────────────────────────────────────────────────────────────────
function Toolbar({ editor, accent, rawMode, onToggleRaw }) {
  if (!editor) return null

  const btn = (active, onClick, title, children) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`${classes.toolBtn} ${active ? classes.toolBtnActive : ''}`}
    >
      {children}
    </button>
  )

  return (
    <div className={classes.toolbar}>
      {/* Bold */}
      {btn(
        editor.isActive('bold'),
        () => editor.chain().focus().toggleBold().run(),
        'Жирный (Ctrl+B)',
        <b>B</b>
      )}

      {/* Italic */}
      {btn(
        editor.isActive('italic'),
        () => editor.chain().focus().toggleItalic().run(),
        'Курсив (Ctrl+I)',
        <i>I</i>
      )}

      <div className={classes.sep} />

      {/* H3 */}
      {btn(
        editor.isActive('heading', { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        'Заголовок',
        <span>H3</span>
      )}

      <div className={classes.sep} />

      {/* Bullet list */}
      {btn(
        editor.isActive('bulletList'),
        () => editor.chain().focus().toggleBulletList().run(),
        'Маркированный список',
        <span>• —</span>
      )}

      {/* Ordered list */}
      {btn(
        editor.isActive('orderedList'),
        () => editor.chain().focus().toggleOrderedList().run(),
        'Нумерованный список',
        <span>1.</span>
      )}

      {/* Justify */}
      {btn(
        editor.isActive({ textAlign: 'justify' }),
        () => editor.chain().focus().setTextAlign(
          editor.isActive({ textAlign: 'justify' }) ? 'left' : 'justify'
        ).run(),
        'По ширине',
        <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
          <rect x="0" y="0"  width="14" height="1.5" rx="0.75"/>
          <rect x="0" y="3"  width="14" height="1.5" rx="0.75"/>
          <rect x="0" y="6"  width="14" height="1.5" rx="0.75"/>
          <rect x="0" y="9"  width="14" height="1.5" rx="0.75"/>
        </svg>
      )}

      <div className={classes.sep} />

      {/* Цвет акцента */}
      <button
        type="button"
        title="Акцентный цвет"
        className={`${classes.toolBtn} ${editor.isActive('textStyle', { color: accent }) ? classes.toolBtnActive : ''}`}
        onClick={() => {
          if (editor.isActive('textStyle', { color: accent })) {
            editor.chain().focus().unsetColor().run()
          } else {
            editor.chain().focus().setColor(accent).run()
          }
        }}
      >
        <span style={{ color: accent, fontWeight: 700 }}>A</span>
      </button>

      <div className={classes.sep} />

      {/* Raw режим */}
      <button
        type="button"
        title="Редактировать HTML"
        className={`${classes.toolBtn} ${rawMode ? classes.toolBtnActive : ''}`}
        onClick={onToggleRaw}
      >
        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{'</>'}</span>
      </button>
    </div>
  )
}
