export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'spoilers' | 'updates' | 'codes' | 'events';
  imageUrl: string;
  date: string;
  author: string;
}

export interface SpoilerConfig {
  title: string;
  description: string;
  revealDateOverride?: string; // in case they want a custom specific date
}

export interface FeaturedVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  type: 'game_highlight' | 'panel_video';
  author?: string;
  createdAt: number;
}

export interface Theory {
  id: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  createdAt: number;
}

export interface ShortItem {
  id: string;
  title: string;
  youtubeUrl: string;
  createdAt: number;
}

export interface AppSettings {
  logoUrl?: string;
  spoilerTitle?: string;
  spoilerDesc?: string;
  extraCountdownTitle?: string;
  extraCountdownDate?: string; // ISO string or date string
  extraCountdownEnabled?: boolean;
  isDelayed?: boolean;
  delayMessage?: string;
  giftCountdownTitle?: string;
  giftCountdownDate?: string;
  giftCountdownEnabled?: boolean;
  giftCountdownContent?: string;
}

export interface PastSpoiler {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: number;
  ratingSum?: number;
  ratingCount?: number;
  reactions?: Record<string, number>;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'story_published' | 'countdown_alert' | 'custom_push' | 'delayed_alert';
  createdAt: number;
}

export interface AppComment {
  id: string;
  targetId: string; // theory id or video id
  targetType: 'theory' | 'video';
  authorName: string;
  authorId?: string; // firebase user uid if authenticated
  authorAvatar?: string; // photoURL if logged in
  content: string;
  status: 'approved' | 'pending_review' | 'blocked';
  createdAt: number;
}


