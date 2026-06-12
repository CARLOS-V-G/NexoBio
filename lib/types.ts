export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED';
export type ReportReason = 'illegal_content' | 'minor' | 'non_consensual' | 'spam' | 'fraud' | 'other';
export type ButtonStyle = 'rounded' | 'pill' | 'square' | 'outline';

export interface DbUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  headline: string;
  avatar_url: string;
  cover_url: string;
  is_adult: boolean;
  is_public: boolean;
  theme_primary_color: string;
  theme_text_color: string;
  theme_background: string;
  button_style: ButtonStyle;
  social_instagram: string;
  social_twitter: string;
  social_tiktok: string;
  social_telegram: string;
  social_youtube: string;
  social_onlyfans: string;
  total_views: number;
  total_clicks: number;
  created_at: string;
  updated_at: string;
}

export interface DbLink {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  description: string;
  order: number;
  is_active: boolean;
  color: string;
  icon: string;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbReport {
  id: string;
  profile_id: string;
  reason: ReportReason;
  description: string;
  reporter_email: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithUser extends DbProfile {
  users: DbUser;
}

export interface PublicProfile {
  user: DbUser;
  profile: DbProfile;
  links: DbLink[];
}

export const RESERVED_USERNAMES = [
  'admin', 'login', 'register', 'dashboard', 'api', 'settings',
  'terms', 'privacy', 'report', 'moderator', 'support', 'help',
  'about', 'contact', 'blog', 'news', 'home', 'app', 'auth',
  'static', 'public', 'assets', 'images', 'uploads', 'cdn',
];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  illegal_content: 'Contenido ilegal',
  minor: 'Menor de edad',
  non_consensual: 'Contenido no consentido',
  spam: 'Spam',
  fraud: 'Fraude o engaño',
  other: 'Otro',
};

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
