import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

interface Audience {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  category: string;
  tags: string[];
  is_featured: boolean;
  sports_league: string | null;
  created_at: string;
  updated_at: string;
}

function getDisplayName(audience: Audience, allAudiences: Audience[]): string {
  if (audience.display_name) {
    return audience.display_name;
  }

  const parts = audience.name.split('>').map(part => part.trim());
  const lastName = parts[parts.length - 1];

  const duplicates = allAudiences.filter(a => {
    const otherParts = a.name.split('>').map(part => part.trim());
    const otherLastName = otherParts[otherParts.length - 1];
    return otherLastName === lastName;
  });

  if (duplicates.length > 1) {
    const parentContext = parts.length >= 2 ? parts[parts.length - 2] : 'Root';
    return `${lastName} - ${parentContext}`;
  }

  return lastName;
}

async function exportAudiences() {
  console.log('Fetching all audiences from Supabase...');

  let allAudiences: Audience[] = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('audiences')
      .select('id, name, display_name, description, category, tags, is_featured, sports_league, created_at, updated_at')
      .order('name', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching audiences:', error);
      break;
    }

    if (data) {
      allAudiences = [...allAudiences, ...data];
      console.log(`Fetched ${data.length} audiences (total: ${allAudiences.length})`);
      hasMore = data.length === pageSize;
      from += pageSize;
    } else {
      hasMore = false;
    }
  }

  console.log(`\nTotal audiences fetched: ${allAudiences.length}`);

  // Compute display names
  console.log('Computing display names...');
  const audiencesWithDisplayNames = allAudiences.map(audience => ({
    ...audience,
    computed_display_name: getDisplayName(audience, allAudiences)
  }));

  // Export full data
  console.log('\nExporting full data to audiences-full.json...');
  fs.writeFileSync(
    'audiences-full.json',
    JSON.stringify(audiencesWithDisplayNames, null, 2),
    'utf-8'
  );

  // Export minimal data (for static HTML)
  console.log('Exporting minimal data to audiences-minimal.json...');
  const minimalAudiences = audiencesWithDisplayNames.map(a => ({
    id: a.id,
    name: a.name,
    displayName: a.computed_display_name,
    category: a.category,
    tags: a.tags,
    league: a.sports_league,
    featured: a.is_featured
  }));
  fs.writeFileSync(
    'audiences-minimal.json',
    JSON.stringify(minimalAudiences, null, 2),
    'utf-8'
  );

  // Export grouped by category
  console.log('Exporting grouped by category to audiences-by-category.json...');
  const byCategory: Record<string, any[]> = {};
  audiencesWithDisplayNames.forEach(audience => {
    if (!byCategory[audience.category]) {
      byCategory[audience.category] = [];
    }
    byCategory[audience.category].push({
      id: audience.id,
      name: audience.name,
      displayName: audience.computed_display_name,
      tags: audience.tags,
      league: audience.sports_league,
      featured: audience.is_featured
    });
  });

  fs.writeFileSync(
    'audiences-by-category.json',
    JSON.stringify(byCategory, null, 2),
    'utf-8'
  );

  // Export categories list
  console.log('Exporting categories list to categories.json...');
  const categories = Array.from(new Set(allAudiences.map(a => a.category))).sort();
  fs.writeFileSync(
    'categories.json',
    JSON.stringify(categories, null, 2),
    'utf-8'
  );

  // Export statistics
  console.log('Generating statistics...');
  const stats = {
    totalAudiences: allAudiences.length,
    totalCategories: categories.length,
    featuredCount: allAudiences.filter(a => a.is_featured).length,
    byCategory: categories.map(cat => ({
      category: cat,
      count: allAudiences.filter(a => a.category === cat).length
    })).sort((a, b) => b.count - a.count),
    byLeague: Array.from(
      new Set(allAudiences.map(a => a.sports_league).filter(Boolean))
    ).map(league => ({
      league,
      count: allAudiences.filter(a => a.sports_league === league).length
    })).sort((a, b) => b.count - a.count),
    topTags: getTopTags(allAudiences, 20)
  };

  fs.writeFileSync(
    'audiences-stats.json',
    JSON.stringify(stats, null, 2),
    'utf-8'
  );

  console.log('\n✅ Export complete!');
  console.log(`\nFiles generated:`);
  console.log(`  - audiences-full.json (${formatFileSize('audiences-full.json')})`);
  console.log(`  - audiences-minimal.json (${formatFileSize('audiences-minimal.json')})`);
  console.log(`  - audiences-by-category.json (${formatFileSize('audiences-by-category.json')})`);
  console.log(`  - categories.json (${formatFileSize('categories.json')})`);
  console.log(`  - audiences-stats.json (${formatFileSize('audiences-stats.json')})`);

  console.log(`\nStatistics:`);
  console.log(`  Total audiences: ${stats.totalAudiences}`);
  console.log(`  Categories: ${stats.totalCategories}`);
  console.log(`  Featured: ${stats.featuredCount}`);
  console.log(`\nTop 5 categories:`);
  stats.byCategory.slice(0, 5).forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.category}: ${item.count} audiences`);
  });
}

function getTopTags(audiences: Audience[], limit: number): Array<{ tag: string; count: number }> {
  const tagCounts = new Map<string, number>();

  audiences.forEach(audience => {
    audience.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function formatFileSize(filePath: string): string {
  const stats = fs.statSync(filePath);
  const sizeInKB = stats.size / 1024;
  if (sizeInKB > 1024) {
    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  }
  return `${sizeInKB.toFixed(2)} KB`;
}

exportAudiences().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
