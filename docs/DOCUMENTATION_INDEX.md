# Documentation Index

This document provides an overview of all documentation files for creating a static HTML version of the audience browser.

---

## 📋 Quick Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| **STATIC_HTML_GUIDE.md** | Complete implementation guide | Start here for step-by-step instructions |
| **AUDIENCE_DISPLAY_LOGIC.md** | Display logic reference | Understand sorting and filtering logic |
| **AUDIENCE_DATA_STRUCTURE.md** | Data format documentation | Understand data structure and fields |
| **static-html/static-example.html** | Working HTML example | See a complete working implementation |
| **scripts/scripts/export-audiences-json.ts** | Data export tool | Generate JSON files from database |

---

## 🚀 Getting Started

### For Developers Building Static HTML

1. **Read the guide:** Start with `STATIC_HTML_GUIDE.md`
2. **Export data:** Run `npm run export-audiences`
3. **Study example:** Open `static-html/static-example.html` in a browser
4. **Reference logic:** Use `AUDIENCE_DISPLAY_LOGIC.md` as needed

### For Understanding the System

1. **Data structure:** Read `AUDIENCE_DATA_STRUCTURE.md`
2. **Display logic:** Read `AUDIENCE_DISPLAY_LOGIC.md`
3. **Implementation:** See how it's used in `static-html/static-example.html`

---

## 📚 File Details

### STATIC_HTML_GUIDE.md
**Complete implementation guide for creating a static HTML version**

Contains:
- Step-by-step implementation instructions
- Complete code examples for all features
- Search, filter, and sort implementations
- Performance optimization tips
- Browser compatibility notes
- Deployment guidance

**Best for:** Developers implementing the static version

---

### AUDIENCE_DISPLAY_LOGIC.md
**Detailed documentation of how audiences are displayed**

Contains:
- Data fetching logic
- Display name generation rules
- All filtering logic (search, category, profile)
- Sorting algorithms for different modes
- Display states and pagination
- Database function details
- Performance optimizations

**Best for:** Understanding the business logic and requirements

---

### AUDIENCE_DATA_STRUCTURE.md
**Complete reference for the audience data format**

Contains:
- Database schema
- Field descriptions and types
- Data validation rules
- JSON structure examples
- Export formats
- API endpoint patterns
- Hierarchical name parsing

**Best for:** Understanding what data is available and how it's structured

---

### static-html/static-example.html
**Fully functional example implementation**

Contains:
- Complete working HTML page
- Embedded JavaScript with all logic
- Styling and responsive design
- Search, filter, and copy functionality
- Commented code for learning

**Best for:** Seeing how it all works together

---

### scripts/export-audiences-json.ts
**TypeScript script to export audience data**

Generates:
- `audiences-full.json` - Complete data
- `audiences-minimal.json` - Optimized for static HTML
- `audiences-by-category.json` - Pre-grouped by category
- `categories.json` - List of categories
- `audiences-stats.json` - Statistics

**Usage:**
```bash
npm run export-audiences
```

---

## 🔍 Key Concepts

### Display Name Generation
How audience names are simplified for display:
- Full: `"Genius Sports > Baseball > MLB > New York Yankees"`
- Display: `"New York Yankees"`
- With context: `"New York Yankees - MLB"` (if duplicates exist)

See: `AUDIENCE_DATA_STRUCTURE.md` section on "Hierarchical Name Parsing"

### Search Logic
Three types of search:
1. **Semantic Search** - AI-powered (requires backend)
2. **Text Search** - Simple keyword matching (works in static HTML)
3. **Profile Search** - Filtered by leagues/categories

See: `AUDIENCE_DISPLAY_LOGIC.md` section on "Filtering Logic"

### Sorting Priority
Different sorting rules for different contexts:
1. **Search results** - By relevance
2. **Category filter** - Teams first, then alphabetical
3. **Default view** - Major leagues first

See: `AUDIENCE_DISPLAY_LOGIC.md` section on "Sorting Logic"

---

## 🎯 Common Tasks

### "I want to implement search"
1. Read: `AUDIENCE_DISPLAY_LOGIC.md` → "Filtering Logic" → "Search Filter"
2. See example: `static-html/static-example.html` → `simpleSearch()` function
3. Full guide: `STATIC_HTML_GUIDE.md` → "Step 3: Implement Search"

### "I want to implement sorting"
1. Read: `AUDIENCE_DISPLAY_LOGIC.md` → "Sorting Logic"
2. See example: `static-html/static-example.html` → `defaultSort()` and `sortByCategory()`
3. Full guide: `STATIC_HTML_GUIDE.md` → "Step 5: Implement Sorting"

### "I want to understand the data structure"
1. Read: `AUDIENCE_DATA_STRUCTURE.md` → "Audience Object Structure"
2. See examples: `AUDIENCE_DATA_STRUCTURE.md` → "JSON Example"
3. Export real data: Run `npm run export-audiences`

### "I want to implement filtering by category"
1. Read: `AUDIENCE_DISPLAY_LOGIC.md` → "Filtering Logic" → "Category Filter"
2. See example: `static-html/static-example.html` → `toggleCategory()` function
3. Full guide: `STATIC_HTML_GUIDE.md` → "Step 4: Implement Filtering"

### "I need to generate display names"
1. Read: `AUDIENCE_DATA_STRUCTURE.md` → "Hierarchical Name Parsing"
2. See example: `static-html/static-example.html` → `getDisplayName()` function
3. Full guide: `STATIC_HTML_GUIDE.md` → "Step 2: Build Display Name Cache"

---

## 💡 Implementation Patterns

### Minimal Implementation (No search, basic display)
Required files:
- `audiences-minimal.json`
- Basic HTML/CSS
- Simple list rendering

Complexity: ⭐ (Simple)

### Standard Implementation (Search + filters)
Required files:
- `audiences-minimal.json`
- `categories.json`
- Full HTML/CSS/JS from guide

Complexity: ⭐⭐⭐ (Medium)

### Advanced Implementation (Semantic search)
Required:
- Backend API for embeddings
- Database with vector search
- Full React application

Complexity: ⭐⭐⭐⭐⭐ (Complex)

See: `STATIC_HTML_GUIDE.md` for choosing the right implementation

---

## 🛠️ Tools and Scripts

### Export Audiences Data
```bash
npm run export-audiences
```

Generates all JSON files needed for static HTML implementation.

### Generate Embeddings (Advanced)
```bash
npm run generate-embeddings
```

Only needed if implementing semantic search with backend.

---

## 📊 Data Flow Diagram

```
Database (Supabase)
    ↓
scripts/export-audiences-json.ts
    ↓
audiences-minimal.json
    ↓
static-html/static-example.html
    ↓
User Browser
```

For static HTML:
```
User Input (search/filter)
    ↓
JavaScript Filter/Sort
    ↓
Display Filtered Results
    ↓
User Copies Audience
```

---

## 🔗 Related Files

### React Application Files
If you want to see the original React implementation:
- `src/apps/main/pages/MainHome.tsx` - Main variant home page
- `src/utils/audienceDisplay.ts` - Display name logic
- `src/lib/semanticSearch.ts` - Semantic search implementation
- `src/components/AudienceCard.tsx` - Card display component

### Database Files
- `supabase/migrations/*.sql` - Database schema
- `supabase/functions/generate-embeddings/` - Edge function for embeddings

---

## ❓ FAQ

### Q: Do I need to implement semantic search?
**A:** No. For static HTML, simple text search works well. Semantic search requires a backend.

### Q: Can I use the React components?
**A:** The React code can be a reference, but you'll need to rewrite it in vanilla JavaScript for static HTML.

### Q: How do I get the data?
**A:** Run `npm run export-audiences` to generate JSON files from the database.

### Q: What browsers are supported?
**A:** Modern browsers (Chrome, Firefox, Safari, Edge). See `STATIC_HTML_GUIDE.md` for compatibility details.

### Q: Can I modify the sorting logic?
**A:** Yes, the logic is fully documented in `AUDIENCE_DISPLAY_LOGIC.md`. Modify as needed.

### Q: How often should I update the JSON data?
**A:** Depends on how often audiences change. Weekly or monthly exports are typical.

---

## 📞 Support

If you need help:
1. Check the relevant documentation file
2. Look at the example implementation
3. Review the FAQ section above

---

## 📝 Version History

- **2025-02-03** - Initial documentation created
  - All core documentation files
  - Working example implementation
  - Export tool and scripts

---

## ✅ Documentation Checklist

Use this checklist when implementing:

- [ ] Read `STATIC_HTML_GUIDE.md`
- [ ] Export data with `npm run export-audiences`
- [ ] Study `static-html/static-example.html`
- [ ] Understand display name generation
- [ ] Implement search functionality
- [ ] Implement category filtering
- [ ] Implement sorting (default + category modes)
- [ ] Add pagination ("See More" button)
- [ ] Test copy to clipboard
- [ ] Test on multiple browsers
- [ ] Deploy to static hosting

---

## 🎓 Learning Path

**Beginner:**
1. Open `static-html/static-example.html` in browser
2. View source and read comments
3. Modify colors/styling to understand structure

**Intermediate:**
1. Read `AUDIENCE_DATA_STRUCTURE.md`
2. Export data with `npm run export-audiences`
3. Modify `static-html/static-example.html` to use real data
4. Implement custom features

**Advanced:**
1. Read `AUDIENCE_DISPLAY_LOGIC.md` completely
2. Study React implementation in `src/` folder
3. Implement semantic search with backend
4. Add analytics and tracking
