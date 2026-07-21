# Audience Data Structure

## Database Schema

### Table: `audiences`

```sql
CREATE TABLE audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  sports_league TEXT,
  total_revenue NUMERIC,
  embedding VECTOR(384),  -- For semantic search
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Audience Object Structure

### TypeScript Interface
```typescript
interface Audience {
  id: string;                    // UUID
  name: string;                  // Full hierarchical name
  display_name: string | null;  // Optional simplified name
  description: string | null;    // Optional description
  category: string;              // Category (e.g., "Baseball", "Football")
  tags: string[];                // Array of tags
  is_featured: boolean;          // Featured flag
  sports_league: string | null;  // League code (e.g., "MLB", "NFL")
  total_revenue?: number;        // Optional revenue data
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
}
```

### JSON Example
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Genius Sports > Baseball > MLB > New York Yankees",
  "display_name": "New York Yankees",
  "description": "Fans of the New York Yankees baseball team",
  "category": "Baseball",
  "tags": ["team", "mlb", "baseball", "yankees"],
  "is_featured": true,
  "sports_league": "MLB",
  "total_revenue": 5000000,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T12:30:00Z"
}
```

---

## Field Details

### `name` (Required)
**Format:** Hierarchical path separated by " > "

**Pattern:** `"Company > Sport > League > Specific Audience"`

**Examples:**
- `"Genius Sports > Football > NFL > Dallas Cowboys"`
- `"Genius Sports > Basketball > NBA > NBA Fans"`
- `"Genius Sports > College Sports > Fans > Duke University"`

**Usage:** This is the full identifier and what gets copied to clipboard

---

### `display_name` (Optional)
**Purpose:** Simplified name for UI display

**Examples:**
- `"Dallas Cowboys"` (from full name above)
- `"NBA Fans"`
- `"Duke University"`

**Logic:** If not provided, extract from last part of `name`

---

### `category` (Required)
**Purpose:** Top-level grouping for filtering

**Common Values:**
- `"Baseball"`
- `"Basketball"`
- `"Football"`
- `"Hockey"`
- `"Soccer"`
- `"College Sports"`
- `"Betting, Gaming & Wagering"`
- `"Lifestyle"`
- `"Women's Sports"`
- `"Youth Sports"`

---

### `tags` (Array)
**Purpose:** Additional metadata for searching and categorization

**Common Tags:**
- `"team"` - Individual team audience
- `"fans"` - General fan audience
- `"league"` - League-level audience
- `"demographic"` - Demographic segment
- `"lifestyle"` - Lifestyle-based audience
- `"gear"` - Sports gear/equipment related
- `"venue"` - Venue/stadium related

**Example Array:**
```json
["team", "mlb", "baseball", "yankees", "fans"]
```

---

### `sports_league` (Optional)
**Purpose:** League association for league-level filtering

**Common Values:**
- `"NFL"` - National Football League
- `"NBA"` - National Basketball Association
- `"MLB"` - Major League Baseball
- `"NHL"` - National Hockey League
- `"MLS"` - Major League Soccer
- `"NCAA"` - College sports
- `"WNBA"` - Women's NBA
- `"NWSL"` - Women's Soccer League

---

### `is_featured` (Boolean)
**Purpose:** Mark audiences to highlight in featured section

**Usage:**
- Featured audiences appear at top in special section
- Limited to 6 featured audiences displayed
- Can be used for promotional/priority audiences

---

### `total_revenue` (Optional Number)
**Purpose:** Revenue data for sorting/filtering high-value audiences

**Usage:**
- Used in profile-based search to boost high-revenue audiences
- Calculated as: `log10(revenue + 1) * 0.05`

---

## Hierarchical Name Parsing

### Parsing Logic
```javascript
function parseHierarchy(name) {
  const parts = name.split('>').map(p => p.trim());

  return {
    company: parts[0],           // "Genius Sports"
    sport: parts[1],             // "Baseball"
    league: parts[2],            // "MLB"
    audience: parts[3],          // "New York Yankees"
    fullPath: parts,
    lastName: parts[parts.length - 1]
  };
}
```

### Display Name Generation
```javascript
function generateDisplayName(audience, allAudiences) {
  const parts = audience.name.split('>').map(p => p.trim());
  const lastName = parts[parts.length - 1];

  // Check if this lastName is unique
  const duplicates = allAudiences.filter(a => {
    const otherParts = a.name.split('>').map(p => p.trim());
    return otherParts[otherParts.length - 1] === lastName;
  });

  // If duplicates exist, add parent context
  if (duplicates.length > 1) {
    const parent = parts[parts.length - 2] || 'Root';
    return `${lastName} - ${parent}`;
  }

  // If unique, just use last name
  return lastName;
}
```

**Examples:**
```javascript
// Unique audience
"Genius Sports > Football > NFL > Dallas Cowboys"
→ "Dallas Cowboys"

// Duplicate audience names
"Genius Sports > Basketball > NBA > Complete Player Gear"
"Genius Sports > Baseball > MLB > Complete Player Gear"
→ "Complete Player Gear - NBA"
→ "Complete Player Gear - MLB"
```

---

## Export Formats

### CSV Export
```csv
id,name,display_name,category,tags,sports_league,is_featured
"uuid-1","Genius Sports > Baseball > MLB > Yankees","New York Yankees","Baseball","team,mlb,baseball","MLB","true"
```

### JSON Export (Array)
```json
[
  {
    "id": "uuid-1",
    "name": "Genius Sports > Baseball > MLB > Yankees",
    "display_name": "New York Yankees",
    "category": "Baseball",
    "tags": ["team", "mlb", "baseball"],
    "sports_league": "MLB",
    "is_featured": true
  }
]
```

### JSON Export (Grouped by Category)
```json
{
  "Baseball": [
    {
      "id": "uuid-1",
      "name": "Genius Sports > Baseball > MLB > Yankees",
      "display_name": "New York Yankees",
      "tags": ["team", "mlb"]
    }
  ],
  "Football": [...]
}
```

---

## API Endpoints (if implementing)

### Get All Audiences
```
GET /api/audiences
```

**Response:**
```json
{
  "data": [...],
  "count": 1000,
  "page": 1,
  "pageSize": 100
}
```

### Search Audiences
```
GET /api/audiences/search?q=yankees
```

**Response:**
```json
{
  "results": [...],
  "count": 15,
  "query": "yankees"
}
```

### Get by Category
```
GET /api/audiences?category=Baseball
```

### Get Featured
```
GET /api/audiences?featured=true
```

---

## Data Validation Rules

### Name
- Required, non-empty
- Must contain " > " separators
- Minimum 2 parts (Company > Audience)

### Category
- Required, non-empty
- Should be from predefined list

### Tags
- Array of strings
- Each tag lowercase
- No spaces in individual tags (use hyphens)

### Sports League
- Optional
- Should be uppercase code (e.g., "NFL", not "nfl")
- From predefined list of valid leagues

---

## Sample Query to Export Data

```sql
-- Export all audiences with computed display names
SELECT
  id,
  name,
  COALESCE(
    display_name,
    split_part(name, '>', -1)
  ) as display_name,
  category,
  tags,
  sports_league,
  is_featured,
  created_at
FROM audiences
ORDER BY
  is_featured DESC,
  category ASC,
  name ASC;
```

---

## Static HTML Implementation

For a static HTML version, you can:

1. **Export to JSON file:**
```javascript
// audiences.json
[
  { /* audience 1 */ },
  { /* audience 2 */ },
  ...
]
```

2. **Load in HTML:**
```html
<script src="audiences.json"></script>
<script>
  // audiences array is now available
  console.log(audiences.length);
</script>
```

3. **Or fetch from API:**
```javascript
async function loadAudiences() {
  const response = await fetch('/api/audiences');
  const audiences = await response.json();
  return audiences;
}
```
