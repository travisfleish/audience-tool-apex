# Audience Display Logic Documentation

## Overview
This document explains how audiences are fetched, filtered, sorted, and displayed in the application.

---

## 1. Data Fetching

### Initial Load
```javascript
// Fetches ALL audiences from Supabase in pages of 1000
const { data } = await supabase
  .from('audiences')
  .select('id, name, display_name, description, category, tags, is_featured, sports_league, created_at, updated_at')
  .order('is_featured', { ascending: false })
  .order('name', { ascending: true })
  .range(from, from + pageSize - 1);
```

**Key Fields:**
- `name`: Full hierarchical name (e.g., "Genius Sports > Baseball > MLB > New York Yankees")
- `display_name`: Simplified name for display
- `category`: Category (e.g., "Baseball", "Football")
- `tags`: Array of tags (e.g., ["team", "mlb"])
- `is_featured`: Boolean for featured audiences
- `sports_league`: League code (e.g., "MLB", "NFL")

---

## 2. Display Name Generation

### Function: `getDisplayName(audience, allAudiences)`
Located in: `src/utils/audienceDisplay.ts`

**Logic:**
1. Split the full name by ">" to get hierarchy parts
2. Take the last part as the base display name
3. Check for duplicates with same last part
4. If duplicates exist, add parent context: `"lastName - parentContext"`
5. If unique, just use the last part

**Example:**
```javascript
// Input: "Genius Sports > Baseball > MLB > Yankees"
// Output: "Yankees" (if unique)
// Output: "Yankees - MLB" (if duplicates exist)
```

---

## 3. Filtering Logic

### Three Filter Types:

#### A. Search Filter (3+ characters)
**Triggers:** When search query has 3 or more characters

**Process:**
1. Generate embedding for search query via Edge Function
2. Call `hybrid_semantic_search` database function
3. Combines:
   - Vector similarity search (semantic matching)
   - Keyword text matching
   - Team tag boosting (when searching for team names)

**Parameters:**
```javascript
{
  query_text: searchQuery,
  query_embedding: embedding,
  match_threshold: 0.5,  // Minimum similarity score
  match_count: 50        // Max results
}
```

**Search includes:**
- Display name
- Full hierarchical name
- Description
- Tags

#### B. Category Filter
**Triggers:** When user clicks a category button

**Logic:**
```javascript
// Filter audiences where category matches selected
audiences.filter(audience =>
  audience.category === selectedCategory
)
```

#### C. Profile Filter
**Triggers:** When URL has profile parameter (e.g., `?p=profile-id`)

**Process:**
1. Filter by leagues OR categories from profile config
2. Filter by required tags
3. Apply keyword matching if search query exists
4. Boost results by:
   - Keyword matches (+0.2 per keyword)
   - Revenue (log10 scale * 0.05)
5. Sort by relevance score

**Profile Config Structure:**
```javascript
{
  displayName: "Profile Name",
  leagues: ["MLB", "NBA"],
  categories: ["Baseball"],
  requiredTags: ["team"],
  boostKeywords: ["championship", "playoff"]
}
```

---

## 4. Sorting Logic

### A. When Search is Active
**Returns results as-is** - already ordered by relevance from semantic search

### B. When Category Filter is Active
Uses `sortAudiencesByCategory()` with hierarchy:

**Priority Order:**
1. **General League Fans** (e.g., "NFL Fans", "NBA Fans")
2. **High Value Fans** (audiences with "high value fans" in name)
3. **Team Audiences** (have "team" tag) - sorted alphabetically
4. **Generational Audiences** (Gen Z, Millennial, etc.)
   - Gen Z appears first
   - Others sorted alphabetically
5. **Other Audiences** - sorted alphabetically

### C. Default Sorting (No Filters)
**Priority Order:**
```javascript
1. "NFL Fans" (priority 1)
2. "NBA Fans" (priority 2)
3. "MLB Fans" (priority 3)
4. "NHL Fans" (priority 4)
5. "MLS Fans" (priority 5)
6. "College Football Fans" (priority 6)
7. "College Basketball Fans" (priority 7)
10. Other league-level fans (priority 10)
1000. Everything else (sorted alphabetically)
```

---

## 5. Display Logic

### Initial Display (No Filters)
Shows **first 9 audiences** with "See More" button

**Layout:**
- 3-column grid on desktop
- 2-column on tablet
- 1-column on mobile

### With Filters Active
Shows **first 9 results** with "See More" button

### "See All" State
Shows **all filtered results** (removes limit)

---

## 6. Audience Card Display

Each card shows:

**Top Section:**
- Display name (large, bold)
- Copy button (copies full hierarchical name)

**Middle Section:**
- Full hierarchical name (gray text)
- Tags (small rounded pills)

**Bottom Section:**
- "Add to Notebook" button
- Shows "In Notebook" if already added (disabled)

**Special Styling:**
- Featured audiences have neon border and "TOP PICK" badge
- Hover effects on cards and buttons

---

## 7. Featured Audiences

**Selection:**
- Filter audiences where `is_featured = true`
- Take first 6 results
- Display in special carousel/grid at top

**Always Visible:**
- Shows on initial load
- Moves to bottom when filters are active
- Hidden when search has 3+ characters

---

## 8. Search States

### Loading State
Shows when:
- Search query >= 3 characters
- Waiting for semantic search results

**Display:**
```
[Spinning loader icon]
"Searching with AI..."
```

### No Results
Shows when filtered list is empty:
```
"No audiences found matching your criteria."
```

### Results Count
Header shows:
- "Search Results (X)" when searching
- "All Audiences (X)" in default view

---

## 9. URL State Management

### Search Params
- `?p=profile-id` - Activates profile filter
- Cleared when user types different query

---

## 10. Key Helper Functions

### `isGeneralLeagueFans(displayName, league)`
Checks if audience is general league-level (e.g., "NBA Fans")

### `hasTeamTag(audience)`
Returns true if tags array includes "team"

### `isGenerationalAudience(displayName)`
Checks for Gen Z, Millennial, Gen X, etc.

### `matchesRequiredTags(audience, requiredTags)`
Verifies audience has all required tags

### `calculateKeywordBoost(audience, boostKeywords)`
Adds +0.2 for each matching keyword

---

## 11. Database Function: `hybrid_semantic_search`

**Combines:**
1. Vector similarity using embeddings
2. Text keyword matching (case-insensitive)
3. Team name boosting

**Returns:**
- Audiences ordered by relevance
- Includes similarity score
- Limited by `match_count` parameter

**Threshold:**
- Default: 0.5
- Can be adjusted for more/fewer results

---

## 12. Performance Optimizations

### Display Name Caching
```javascript
// Computed once and cached using useMemo
const displayNameCache = useMemo(() => {
  const cache = new Map();
  audiences.forEach(audience => {
    cache.set(audience.id, getDisplayName(audience, audiences));
  });
  return cache;
}, [audiences]);
```

### Debounced Search
500ms delay before triggering search to avoid excessive API calls

### Pagination
Initial fetch uses 1000-record pages to load all data efficiently

---

## 13. Filter Combination Behavior

**Search + Category:**
1. Apply semantic search
2. Filter results by category
3. Return in relevance order

**Profile + Search:**
1. Apply profile filters (league/category/tags)
2. Filter by search keywords
3. Sort by relevance score

**Category Only:**
1. Filter by category
2. Apply custom sorting (teams first, etc.)

**No Filters:**
1. Show all audiences
2. Apply default sorting (major leagues first)
3. Limit to 9 initially

---

## 14. HTML Implementation Notes

For a static HTML version, you'll need to:

1. **Pre-fetch all data** - Load audiences JSON upfront
2. **Implement client-side filtering** - JavaScript to filter array
3. **Implement sorting functions** - Replicate priority logic
4. **Build display name cache** - Generate on page load
5. **Handle search** - Either:
   - Client-side keyword matching (simple)
   - API call to Edge Function (semantic)
6. **Manage state** - Track:
   - Current search query
   - Selected category
   - Show all vs limited
   - Copied states
7. **Render cards** - Template/loop through filtered array
8. **Add event listeners** - Search input, filter buttons, cards

### Simplified Approach:
Skip semantic search and use simple text matching:
```javascript
function simpleSearch(audiences, query) {
  const lower = query.toLowerCase();
  return audiences.filter(a => {
    const searchText = `${a.name} ${a.display_name} ${a.description} ${a.tags.join(' ')}`.toLowerCase();
    return searchText.includes(lower);
  });
}
```
