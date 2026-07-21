import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const workbookPath = path.join(rootDir, 'data/moments.xlsx');
const outPath = path.join(rootDir, 'src/core/moments/momentsCatalog.generated.json');

const SPORT_MAP = {
  Football: { slug: 'football', label: 'Football' },
  Basketball: { slug: 'basketball', label: 'Basketball' },
  NHL: { slug: 'nhl', label: 'NHL' },
  MLB: { slug: 'mlb', label: 'MLB' },
  'Soccer / World Cup': { slug: 'soccer_world_cup', label: 'Soccer / World Cup' },
  'All Sport': { slug: 'all_sport', label: 'All Sport' },
};

const SPORT_SLUGS = ['football', 'basketball', 'nhl', 'mlb', 'soccer_world_cup'];

function sportDescriptions(base, examples) {
  return Object.fromEntries(
    SPORT_SLUGS.map(slug => [slug, `${base}, i.e. ${examples[slug]}`]),
  );
}

const EMOTION_SHEETS = [
  {
    sheet: 'Joy',
    slug: 'joy',
    name: 'Joy',
    subtitle: 'Celebration, Triumph',
    description: 'Moments of celebration or triumph, i.e. an Overtime Score',
    sportDescriptions: sportDescriptions('Moments of celebration or triumph', {
      football: 'an Overtime Score',
      basketball: 'a Buzzer-beater',
      nhl: 'an Overtime Goal',
      mlb: 'a Walk-off Home Run',
      soccer_world_cup: 'a Last-minute Winner',
    }),
  },
  {
    sheet: 'Awe & Admiration',
    slug: 'awe_admiration',
    name: 'Awe & Admiration',
    subtitle: 'Spectacle, Brilliance',
    description: 'Moments of spectacle or brilliance, i.e. a Hail Mary',
    sportDescriptions: sportDescriptions('Moments of spectacle or brilliance', {
      football: 'a Hail Mary',
      basketball: 'a Poster Dunk',
      nhl: 'a Breakaway Goal',
      mlb: 'a No-hitter',
      soccer_world_cup: 'a Bicycle Kick',
    }),
  },
  {
    sheet: 'Hope',
    slug: 'hope',
    name: 'Hope',
    subtitle: 'Anticipation, Belief, Will',
    description: 'Moments of anticipation, belief, or will, i.e. a Tying Score',
    sportDescriptions: sportDescriptions('Moments of anticipation, belief, or will', {
      football: 'a Tying Score',
      basketball: 'a Tying Basket',
      nhl: 'a Tying Goal',
      mlb: 'a Tying Run',
      soccer_world_cup: 'an Equalizer',
    }),
  },
  {
    sheet: 'Tension',
    slug: 'tension',
    name: 'Tension',
    subtitle: 'Dread, Threat, Held Breath',
    description: 'Moments of dread, threat, or held breath, i.e. an Overtime Entry',
    sportDescriptions: sportDescriptions('Moments of dread, threat, or held breath', {
      football: 'an Overtime Entry',
      basketball: 'a Final-Minute Crunch',
      nhl: 'an Overtime Entry',
      mlb: 'Extra Innings',
      soccer_world_cup: 'a Penalty Shootout',
    }),
  },
  {
    sheet: 'Sadness',
    slug: 'sadness',
    name: 'Sadness',
    subtitle: 'Empathy, Resilience, Loss',
    description: 'Moments of empathy, resilience, or loss, i.e. a Final Whistle (Loss)',
    sportDescriptions: sportDescriptions('Moments of empathy, resilience, or loss', {
      football: 'a Final Whistle (Loss)',
      basketball: 'a Final Buzzer (Loss)',
      nhl: 'a Final Horn (Loss)',
      mlb: 'a Final Out (Loss)',
      soccer_world_cup: 'a Full-Time Whistle (Loss)',
    }),
  },
  {
    sheet: 'Relief',
    slug: 'relief',
    name: 'Relief',
    subtitle: 'Exhale, Gratitude, Ease',
    description: 'Moments of exhale, gratitude, or ease, i.e. a Clutch Time Stop',
    sportDescriptions: sportDescriptions('Moments of exhale, gratitude, or ease', {
      football: 'a Clutch Time Stop',
      basketball: 'a Clutch Defensive Stop',
      nhl: 'a Clutch Save',
      mlb: 'a Clutch Strikeout',
      soccer_world_cup: 'a Clutch Save',
    }),
  },
];

const CONTEXT_SHEETS = [
  {
    sheet: 'Game-making & Highlight Plays',
    slug: 'game_making',
    name: 'Game-Making / Highlight Plays',
    subtitle: 'Momentum & spectacle',
    description: 'Moments of momentum and spectacle, i.e. a Pick 6',
    sportDescriptions: sportDescriptions('Moments of momentum and spectacle', {
      football: 'a Pick 6',
      basketball: 'a Poster Dunk',
      nhl: 'a Breakaway Goal',
      mlb: 'a Walk-off Home Run',
      soccer_world_cup: 'a Bicycle Kick Goal',
    }),
  },
  {
    sheet: 'Comebacks, Upsets, Underdogs',
    slug: 'comebacks',
    name: 'Comebacks / Upsets / Underdogs',
    subtitle: 'Surprise & resilience',
    description: 'Moments of surprise and resilience, i.e. an Upset Win',
    sportDescriptions: sportDescriptions('Moments of surprise and resilience', {
      football: 'an Upset Win',
      basketball: 'an Upset Win',
      nhl: 'an Upset Win',
      mlb: 'an Upset Win',
      soccer_world_cup: 'an Upset Win',
    }),
  },
  {
    sheet: 'Big Matchup',
    slug: 'big_matchup',
    name: 'Big Matchup',
    subtitle: 'Rivalry, championship, playoff implications',
    description: 'Moments of rivalry or playoff stakes, i.e. a Rivalry Game',
    sportDescriptions: sportDescriptions('Moments of rivalry or playoff stakes', {
      football: 'a Rivalry Game',
      basketball: 'a Rivalry Game',
      nhl: 'a Rivalry Game',
      mlb: 'a Rivalry Game',
      soccer_world_cup: 'a Derby Match',
    }),
  },
  {
    sheet: 'Winners',
    slug: 'winners',
    name: 'Winners',
    subtitle: 'Victory & advancement',
    description: 'Moments of victory and advancement, i.e. a Championship Won',
    sportDescriptions: sportDescriptions('Moments of victory and advancement', {
      football: 'a Championship Won',
      basketball: 'a Championship Won',
      nhl: 'a Stanley Cup Won',
      mlb: 'a World Series Won',
      soccer_world_cup: 'a World Cup Won',
    }),
  },
  {
    sheet: 'Tournament',
    slug: 'tournament',
    name: 'Tournament',
    subtitle: 'World Cup, playoffs & elimination',
    description: 'Moments of playoff or elimination stakes, i.e. an Elimination',
    sportDescriptions: sportDescriptions('Moments of playoff or elimination stakes', {
      football: 'a Playoff Elimination',
      basketball: 'a Playoff Elimination',
      nhl: 'a Playoff Elimination',
      mlb: 'a Playoff Elimination',
      soccer_world_cup: 'a Group-Stage Elimination',
    }),
  },
];

function slugify(value) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-{2,}/g, '-');
}

function parseSheet(wb, name) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
  const items = [];
  let currentSport = 'All Sport';

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const cells = row.map(c => String(c ?? '').trim());
    if (cells.every(c => !c)) continue;

    if (cells[0] && cells[1]) {
      currentSport = cells[0];
      items.push({ sport: currentSport, name: cells[1] });
    } else if (cells[1]) {
      items.push({ sport: currentSport, name: cells[1] });
    } else if (cells[0]) {
      items.push({ sport: currentSport, name: cells[0] });
    }
  }

  return items;
}

function buildPackages(wb, sheetDefs, category) {
  return sheetDefs.map(({ sheet, slug, name, subtitle, description, sportDescriptions }) => {
    const rawItems = parseSheet(wb, sheet);
    const items = rawItems.map((item, index) => {
      const sportSlug = SPORT_MAP[item.sport]?.slug ?? slugify(item.sport);
      const id = `${slug}--${sportSlug}--${slugify(item.name)}--${index}`;
      return { id, name: item.name, sportSlug };
    });

    return {
      id: slug,
      slug,
      category,
      name,
      subtitle,
      ...(description ? { description } : {}),
      ...(sportDescriptions ? { sportDescriptions } : {}),
      items,
    };
  });
}

const wb = XLSX.readFile(workbookPath);

const catalog = {
  sports: Object.values(SPORT_MAP)
    .filter(s => s.slug !== 'all_sport')
    .map(s => ({ slug: s.slug, label: s.label })),
  mindsetPackages: [
    {
      id: 'winning_fans',
      slug: 'winning_fans',
      category: 'mindset',
      name: 'Winning Fans',
      description:
        'Reach fans while their team is ahead or coming off a win — peak optimism and buying intent.',
    },
    {
      id: 'losing_fans',
      slug: 'losing_fans',
      category: 'mindset',
      name: 'Losing Fans',
      description:
        'Reach loyal fans when their team is down or just lost — moments of consolation and resilience.',
    },
    {
      id: 'high_intensity',
      slug: 'high_intensity',
      category: 'mindset',
      name: 'High Intensity',
      description:
        'Reach fans during big plays, close games, and overtime — when attention is at its absolute peak.',
    },
    {
      id: 'low_intensity',
      slug: 'low_intensity',
      category: 'mindset',
      name: 'Low Intensity',
      description:
        'Reach fans during lulls and blowouts — opportunity to have captive second screen viewing or offer comfort offers',
    },
  ],
  emotionPackages: buildPackages(wb, EMOTION_SHEETS, 'emotion'),
  contextPackages: buildPackages(wb, CONTEXT_SHEETS, 'context'),
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
