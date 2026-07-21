# Static HTML Implementation Guide

This guide explains how to create a static HTML version of the audience browser using the logic from the React application.

---

## Quick Start

### 1. Export Audience Data

Export all audiences to JSON format:

```bash
npm run export-audiences
```

This generates 5 files:
- `audiences-full.json` - Complete audience data with all fields
- `audiences-minimal.json` - Minimal data optimized for static HTML
- `audiences-by-category.json` - Audiences grouped by category
- `categories.json` - List of all categories
- `audiences-stats.json` - Statistics about the data

### 2. Review Documentation

Read these files to understand the system:
- `AUDIENCE_DISPLAY_LOGIC.md` - Complete display logic documentation
- `AUDIENCE_DATA_STRUCTURE.md` - Data structure and schema details
- `static-html/static-example.html` - Working example implementation

### 3. Use the Example

Open `docs/static-html/static-example.html` in a browser to see a working static implementation.

---

## Implementation Steps

### Step 1: Load Data

**Option A: Include JSON directly**
```html
<script>
  const audiences = [/* paste JSON here */];
</script>
```

**Option B: Load from external file**
```html
<script src="audiences-minimal.json"></script>
```

**Option C: Fetch from API**
```javascript
async function loadAudiences() {
  const response = await fetch('/api/audiences-minimal.json');
  return await response.json();
}
```

### Step 2: Build Display Name Cache

```javascript
const displayNameCache = new Map();

function buildDisplayNameCache() {
  audiences.forEach(audience => {
    displayNameCache.set(audience.id, getDisplayName(audience));
  });
}

function getDisplayName(audience) {
  // If display_name exists, use it
  if (audience.displayName) {
    return audience.displayName;
  }

  const parts = audience.name.split('>').map(p => p.trim());
  const lastName = parts[parts.length - 1];

  // Check for duplicates
  const duplicates = audiences.filter(a => {
    const otherParts = a.name.split('>').map(p => p.trim());
    return otherParts[otherParts.length - 1] === lastName;
  });

  // Add parent context if duplicates exist
  if (duplicates.length > 1) {
    const parent = parts[parts.length - 2] || 'Root';
    return `${lastName} - ${parent}`;
  }

  return lastName;
}
```

### Step 3: Implement Search

**Simple Text Search:**
```javascript
function searchAudiences(audiences, query) {
  if (query.length < 3) return audiences;

  const lower = query.toLowerCase();

  return audiences.filter(audience => {
    const searchText = [
      audience.name,
      audience.displayName,
      audience.description || '',
      ...(audience.tags || [])
    ].join(' ').toLowerCase();

    return searchText.includes(lower);
  });
}
```

**With Debouncing:**
```javascript
let searchTimer;

function handleSearch(query) {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    const results = searchAudiences(audiences, query);
    renderResults(results);
  }, 500);
}
```

### Step 4: Implement Filtering

```javascript
function filterAudiences(audiences, options) {
  let results = [...audiences];

  // Apply search
  if (options.searchQuery && options.searchQuery.length >= 3) {
    results = searchAudiences(results, options.searchQuery);
  }

  // Apply category filter
  if (options.category) {
    results = results.filter(a => a.category === options.category);
  }

  return results;
}
```

### Step 5: Implement Sorting

```javascript
function sortAudiences(audiences, mode, selectedCategory) {
  if (mode === 'search') {
    // Keep search relevance order
    return audiences;
  }

  if (mode === 'category' && selectedCategory) {
    return sortByCategory(audiences);
  }

  // Default sort
  return defaultSort(audiences);
}

function defaultSort(audiences) {
  const priorityMap = {
    'nfl fans': 1,
    'nba fans': 2,
    'mlb fans': 3,
    'nhl fans': 4,
    'mls fans': 5,
    'college football fans': 6,
    'college basketball fans': 7
  };

  return audiences.sort((a, b) => {
    const nameA = displayNameCache.get(a.id).toLowerCase();
    const nameB = displayNameCache.get(b.id).toLowerCase();

    const priorityA = priorityMap[nameA] || 1000;
    const priorityB = priorityMap[nameB] || 1000;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return nameA.localeCompare(nameB);
  });
}

function sortByCategory(audiences) {
  // Group into buckets
  const generalFans = [];
  const teams = [];
  const generational = [];
  const others = [];

  audiences.forEach(audience => {
    const name = displayNameCache.get(audience.id).toLowerCase();

    if (isGeneralLeagueFans(name, audience.league)) {
      generalFans.push(audience);
    } else if (audience.tags.includes('team')) {
      teams.push(audience);
    } else if (isGenerational(name)) {
      generational.push(audience);
    } else {
      others.push(audience);
    }
  });

  // Sort each bucket
  const sortByName = (a, b) => {
    const nameA = displayNameCache.get(a.id);
    const nameB = displayNameCache.get(b.id);
    return nameA.localeCompare(nameB);
  };

  teams.sort(sortByName);
  generational.sort(sortByName);
  others.sort(sortByName);

  return [...generalFans, ...teams, ...generational, ...others];
}

function isGeneralLeagueFans(name, league) {
  const patterns = [
    'nfl fans', 'nba fans', 'mlb fans', 'nhl fans',
    'mls fans', 'wnba fans', 'nwsl fans', 'pwhl fans'
  ];
  return patterns.includes(name);
}

function isGenerational(name) {
  const keywords = ['gen z', 'millennial', 'gen x', 'boomer'];
  return keywords.some(k => name.includes(k));
}
```

### Step 6: Render Results

```javascript
function renderAudiences(audiences, container, showAll = false) {
  const displayCount = showAll ? audiences.length : Math.min(9, audiences.length);
  const toDisplay = audiences.slice(0, displayCount);

  container.innerHTML = toDisplay.map(audience => createCard(audience)).join('');

  // Show "See More" button if needed
  updateSeeMoreButton(audiences.length, displayCount);
}

function createCard(audience) {
  const displayName = displayNameCache.get(audience.id);
  const tags = audience.tags.map(tag =>
    `<span class="tag">${escapeHtml(tag)}</span>`
  ).join('');

  return `
    <div class="card">
      <h3>${escapeHtml(displayName)}</h3>
      <p class="full-name">${escapeHtml(audience.name)}</p>
      <div class="tags">${tags}</div>
      <button onclick="copyToClipboard('${audience.name}')">
        Copy to Clipboard
      </button>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### Step 7: Copy to Clipboard

```javascript
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show success message
    showToast('Copied to clipboard!');
  }).catch(err => {
    console.error('Copy failed:', err);
  });
}
```

---

## Complete State Management

```javascript
class AudienceBrowser {
  constructor(audiences) {
    this.allAudiences = audiences;
    this.displayNameCache = new Map();
    this.state = {
      searchQuery: '',
      selectedCategory: null,
      showAll: false,
      filteredAudiences: []
    };

    this.buildDisplayNameCache();
    this.render();
  }

  buildDisplayNameCache() {
    this.allAudiences.forEach(audience => {
      this.displayNameCache.set(
        audience.id,
        this.getDisplayName(audience)
      );
    });
  }

  getDisplayName(audience) {
    // Implementation from Step 2
  }

  search(query) {
    this.state.searchQuery = query;
    this.state.showAll = false;
    this.updateAndRender();
  }

  filterByCategory(category) {
    this.state.selectedCategory =
      this.state.selectedCategory === category ? null : category;
    this.state.showAll = false;
    this.updateAndRender();
  }

  showAllResults() {
    this.state.showAll = true;
    this.render();
  }

  updateAndRender() {
    // Filter
    let results = [...this.allAudiences];

    if (this.state.searchQuery.length >= 3) {
      results = this.searchAudiences(results);
    }

    if (this.state.selectedCategory) {
      results = results.filter(
        a => a.category === this.state.selectedCategory
      );
    }

    // Sort
    const sortMode = this.state.searchQuery.length >= 3
      ? 'search'
      : this.state.selectedCategory
        ? 'category'
        : 'default';

    results = this.sortAudiences(results, sortMode);

    this.state.filteredAudiences = results;
    this.render();
  }

  render() {
    const displayCount = this.state.showAll
      ? this.state.filteredAudiences.length
      : Math.min(9, this.state.filteredAudiences.length);

    const toDisplay = this.state.filteredAudiences.slice(0, displayCount);

    // Update DOM
    this.renderCards(toDisplay);
    this.updateHeader(this.state.filteredAudiences.length);
    this.updateSeeMoreButton(
      this.state.filteredAudiences.length,
      displayCount
    );
  }

  // ... other methods
}

// Initialize
const browser = new AudienceBrowser(audiences);
```

---

## Performance Optimization

### 1. Virtual Scrolling (for large lists)
```javascript
// Only render visible items
function renderVisible(audiences, scrollTop, containerHeight) {
  const itemHeight = 200; // approximate card height
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

  const visible = audiences.slice(startIndex, endIndex);
  return visible;
}
```

### 2. Lazy Loading Images
```html
<img src="placeholder.png" data-src="actual-image.png" loading="lazy">
```

### 3. Debouncing
Already covered in search implementation

### 4. Memoization
```javascript
const cache = new Map();

function memoize(fn) {
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const searchAudiences = memoize((audiences, query) => {
  // Search implementation
});
```

---

## Browser Compatibility

### Required Features
- ES6+ JavaScript
- Fetch API (or use XMLHttpRequest polyfill)
- Clipboard API (or use fallback)
- CSS Grid/Flexbox

### Fallbacks

**Clipboard API:**
```javascript
function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for older browsers
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
```

**Fetch API:**
```javascript
function fetchAudiences(url) {
  if (window.fetch) {
    return fetch(url).then(r => r.json());
  }

  // Fallback to XMLHttpRequest
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = reject;
    xhr.send();
  });
}
```

---

## Deployment

### Static Hosting
Upload these files to any static host:
- `index.html`
- `audiences-minimal.json`
- `categories.json`
- `styles.css`
- `app.js`

### CDN Optimization
```html
<!-- Serve JSON from CDN -->
<script src="https://cdn.example.com/audiences-minimal.json"></script>
```

### Compression
Enable gzip compression on server:
```
# .htaccess (Apache)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE text/javascript
</IfModule>
```

---

## Testing

### Test Cases
1. Search with 0-2 characters (should show all)
2. Search with 3+ characters (should filter)
3. Select category (should filter by category)
4. Select category + search (should combine filters)
5. Copy to clipboard (should work)
6. See More button (should load more)
7. Empty results (should show message)

### Browser Testing
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

## Additional Resources

See also:
- `AUDIENCE_DISPLAY_LOGIC.md` - Detailed logic documentation
- `AUDIENCE_DATA_STRUCTURE.md` - Data format details
- `static-html/static-example.html` - Working example
- `scripts/export-audiences-json.ts` - Data export tool
