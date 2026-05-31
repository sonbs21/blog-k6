export interface AuthorInfo {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
}

export interface PostListItem {
  id: string
  slug: string
  title: string
  description: string
  location: string
  cover_image: string | null
  tags: string[]
  author: AuthorInfo
  view_count: number
  favorite_count: number
  published_at: string | null
  is_favorited: boolean
}

export interface PostDetail extends PostListItem {
  content: string
  created_at: string
  updated_at: string
}

export interface AuthorPostDetail extends PostDetail {
  status: 'DRAFT' | 'PUBLISHED'
}

export interface AuthorPostListItem {
  id: string
  slug: string
  title: string
  status: 'DRAFT' | 'PUBLISHED'
  view_count: number
  favorite_count: number
  published_at: string | null
  updated_at: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  role: 'MEMBER' | 'AUTHOR'
  created_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}
