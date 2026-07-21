export interface Audience {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  sports_league: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  preview_image_url: string;
  download_url: string;
  published_date: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileConfig {
  id: string;
  displayName: string;
  leagues?: string[];
  categories?: string[];
  requiredTags?: string[];
  boostKeywords: string[];
}
