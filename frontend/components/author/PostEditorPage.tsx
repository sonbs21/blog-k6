'use client'
import { useState, useRef, useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { ImageIcon, Loader2, X, UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PostEditor } from '@/components/author/PostEditor'
import { useCreatePost, useUpdatePost, useUploadImage } from '@/hooks/useAuthorPost'
import { formatRelativeDate } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(255),
  description: z.string().max(160, 'Max 160 characters'),
  location: z.string().min(1, 'Required'),
  content: z.string().min(10, 'Content is required'),
  cover_image: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
})
type FormValues = z.infer<typeof schema>

interface PostEditorPageProps {
  defaultValues?: Partial<FormValues> & { tags?: string[] }
  slug?: string
  updatedAt?: string
}

export function PostEditorPage({ defaultValues, slug, updatedAt }: PostEditorPageProps) {
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [coverPreview, setCoverPreview] = useState<string | null>(defaultValues?.cover_image ?? null)
  const [isDragging, setIsDragging] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!slug
  const createPost = useCreatePost()
  const updatePost = useUpdatePost(slug ?? '')
  const save = isEditing ? updatePost : createPost
  const uploadCover = useUploadImage()

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'DRAFT', content: '', ...defaultValues },
  })

  const descriptionValue = watch('description') ?? ''

  // ── Tag input ───────────────────────────────────────────────
  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!tag || tags.includes(tag) || tags.length >= 5) return
    setTags((prev) => [...prev, tag])
    setTagInput('')
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  // ── Cover image upload ──────────────────────────────────────
  async function uploadCoverFile(file: File) {
    const url = await uploadCover.mutateAsync(file)
    setValue('cover_image', url)
    setCoverPreview(url)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadCoverFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) uploadCoverFile(file)
  }, [])

  // ── Submit ──────────────────────────────────────────────────
  function onSubmit(values: FormValues) {
    save.mutate({ ...values, tags })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {save.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {(save.error as any)?.response?.data?.detail ?? 'Failed to save. Please try again.'}
        </div>
      )}

      {/* Title */}
      <Input id="title" label="Title" placeholder="Your post title…" error={errors.title?.message} {...register('title')} />

      {/* Description with char counter */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="description" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Description
          </label>
          <span className={cn('text-xs', descriptionValue.length > 140 ? 'text-amber-500' : 'text-muted-foreground')}>
            {descriptionValue.length} / 160
          </span>
        </div>
        <textarea
          id="description"
          rows={2}
          placeholder="One-sentence summary shown in cards and search results"
          className={cn(
            'rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-colors resize-none',
            'placeholder:text-stone-400 focus:outline-none focus:ring-2',
            errors.description
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
              : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:border-forest-500 focus:ring-forest-500/20',
          )}
          {...register('description')}
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      {/* Location + Status row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="location" label="Location" placeholder="Tokyo, Japan" error={errors.location?.message} {...register('location')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Status</label>
          <Controller name="status" control={control} render={({ field }) => (
            <select
              {...field}
              className="rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5 text-sm shadow-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          )} />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Tags</label>
          <span className="text-xs text-muted-foreground">{tags.length} / 5</span>
        </div>
        <div className={cn(
          'flex flex-wrap gap-2 rounded-xl border px-3 py-2.5 min-h-[44px] transition-colors',
          'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus-within:border-forest-500 focus-within:ring-2 focus-within:ring-forest-500/20',
        )}>
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-forest-50 dark:bg-forest-900/30 px-2.5 py-0.5 text-xs font-medium text-forest-700 dark:text-forest-300">
              {tag}
              <button type="button" onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="hover:text-forest-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {tags.length < 5 && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => addTag(tagInput)}
              placeholder={tags.length === 0 ? 'travel, asia, food… (Enter to add)' : ''}
              className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">Press Enter or comma to add a tag. Max 5 tags.</p>
      </div>

      {/* Cover image */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Cover Image</label>
        {coverPreview ? (
          <div className="relative aspect-[3/1] overflow-hidden rounded-xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => { setCoverPreview(null); setValue('cover_image', undefined) }}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => coverInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 transition-colors',
              isDragging
                ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/20'
                : 'border-stone-300 dark:border-stone-700 hover:border-forest-400 hover:bg-muted/50',
            )}
          >
            {uploadCover.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Drag & drop or <span className="font-medium text-forest-700 dark:text-forest-400">click to upload</span>
                </span>
                <span className="text-xs text-muted-foreground">JPEG, PNG, WebP — max 5 MB</span>
              </>
            )}
          </div>
        )}
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* Rich text editor */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Content</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <PostEditor value={field.value} onChange={field.onChange} error={errors.content?.message} />
          )}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {updatedAt ? (
          <p className="text-xs text-muted-foreground">
            Last saved {formatRelativeDate(updatedAt)}
          </p>
        ) : <span />}
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={save.isPending}
            variant={watch('status') === 'PUBLISHED' ? 'secondary' : 'primary'}
          >
            {watch('status') === 'PUBLISHED' ? 'Publish post' : 'Save draft'}
          </Button>
        </div>
      </div>
    </form>
  )
}
