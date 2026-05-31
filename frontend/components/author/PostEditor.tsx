'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import { useRef } from 'react'
import {
  Bold, Italic, Heading2, Heading3, List, Quote, Image as ImageIcon, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUploadImage } from '@/hooks/useAuthorPost'

interface PostEditorProps {
  value: string
  onChange: (html: string) => void
  error?: string
}

export function PostEditor({ value, onChange, error }: PostEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full my-4' } }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none min-h-[320px] p-4 focus:outline-none',
      },
    },
  })

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    try {
      const url = await upload.mutateAsync(file)
      editor.chain().focus().setImage({ src: url }).run()
    } finally {
      e.target.value = ''
    }
  }

  if (!editor) return null

  return (
    <div className={cn('rounded-lg border overflow-hidden', error ? 'border-red-400' : 'border-border')}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-2">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="h-4 w-4" />
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <Quote className="h-4 w-4" />
        </Btn>
        <Sep />
        <Btn onClick={() => fileInputRef.current?.click()} active={false} title="Insert image" disabled={upload.isPending}>
          {upload.isPending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <ImageIcon className="h-4 w-4" />}
        </Btn>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {error && <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function Sep() {
  return <div className="mx-1 h-5 w-px bg-border" />
}

function Btn({ children, onClick, active, title, disabled }: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  title: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded p-1.5 transition-colors disabled:opacity-40',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
