Implement the post search feature for the travel blog. No authentication required.

Read `.claude/agents/backend.md` and `.claude/agents/frontend.md` before writing code.

---

## Backend — FastAPI (`backend/`)

**Endpoint:** `GET /api/v1/search?q={keyword}&page=1&limit=20`

1. **Schema** (`app/schemas/search.py`)
   ```python
   class SearchResult(BaseModel):
       slug: str
       title: str
       description: str
       location: str
       cover_image: str | None
       tags: list[str]
       author_name: str
       published_at: datetime

   class SearchResponse(BaseModel):
       items: list[SearchResult]
       total: int
       page: int
       limit: int
   ```

2. **Service** (`app/services/search_service.py`)
   - Query `posts` table where `status = 'PUBLISHED'`
   - Match keyword (case-insensitive, unaccented) against: `title`, `description`, `location`, `tags`
   - Use PostgreSQL `ILIKE` or `to_tsvector` full-text search
   - Return paginated results ordered by `published_at DESC`

3. **Router** (`app/api/v1/search.py`)
   - No auth dependency — public endpoint
   - Validate: `q` min length 2 chars, `limit` max 50
   - Register at `router = APIRouter(prefix="/search", tags=["search"])`

---

## Frontend — Next.js (`frontend/`)

1. **API hook** (`hooks/useSearch.ts`)
   - `useQuery` triggered only when `q.length >= 2`
   - Debounce input by 300ms before firing
   - `queryKey: ['search', q, page]`

2. **Search bar component** (`components/blog/SearchBar.tsx`) — `"use client"`
   - Controlled input with debounced value
   - Show loading spinner while fetching
   - Clear button when input is non-empty

3. **Search results page** (`app/(blog)/search/page.tsx`)
   - Read `?q=` from `useSearchParams()`
   - Render `PostCard` grid with pagination
   - Show "No results for '{q}'" empty state
   - Show result count: "Found 12 posts for 'hanoi'"
