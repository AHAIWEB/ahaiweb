

## Plan: Menu Control, Daily Content Automation & Dropdown

### Problem Summary
1. **All categories appear in header nav** — no filter; adding a label pushes it to the menu
2. **Horoscope & Quotes are hardcoded** — need daily auto-update from internet
3. **"আজকের এই দিনে" needs a dropdown** in the main header nav with 3 tabs

---

### 1. Category Nav Visibility Control

**Database change:** Add `show_in_nav boolean DEFAULT false` column to `categories` table.

**Header.tsx:** Filter categories query to only show `show_in_nav = true` items in the nav bar.

**CategoryManager.tsx:** Add a toggle switch per category to control `show_in_nav`. This way admins decide which labels appear in the main menu.

---

### 2. Daily Content Automation (Horoscope + Quotes + On This Day)

**Database:** Create `daily_content` table:
- `id`, `content_type` (enum: 'on_this_day', 'horoscope', 'quote'), `date` (date), `data` (jsonb), `created_at`
- Unique constraint on `(content_type, date)`

**Edge Function:** `fetch-daily-content/index.ts`
- Uses Lovable AI (gemini-2.5-flash) to generate:
  - **On This Day**: 3-5 historical events for today's date (Bengali)
  - **Horoscope**: All 12 zodiac signs daily predictions (Bengali)  
  - **Quote**: A daily inspirational quote with author (Bengali)
- Stores results in `daily_content` table
- Checks if today's content already exists before generating

**LeftSidebar.tsx:** Fetch from `daily_content` table instead of hardcoded arrays. Falls back to hardcoded if no data.

**Scheduled job:** Set up pg_cron to call the edge function daily at midnight.

---

### 3. Header Dropdown for "আজকের এই দিনে"

**Header.tsx changes:**
- Add a "📅 আজকের দিনে" button in the category nav bar
- On hover/click, show a dropdown (using Popover or DropdownMenu) with 3 tabs: এই দিনে | রাশি | উক্তি
- Fetch data from the same `daily_content` table
- Horoscope tab shows a grid of 12 zodiac signs; clicking one shows its prediction

---

### Files to Create/Edit

| Action | File |
|--------|------|
| Migration | Add `show_in_nav` to categories, create `daily_content` table |
| Create | `supabase/functions/fetch-daily-content/index.ts` |
| Edit | `src/components/Header.tsx` — filter nav + add dropdown |
| Edit | `src/pages/admin/CategoryManager.tsx` — add nav toggle |
| Edit | `src/components/LeftSidebar.tsx` — use DB data |
| Insert | Set existing core categories' `show_in_nav = true` |
| Insert | pg_cron scheduled job for daily content |

