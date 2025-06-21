export interface User {
  _id: string;
  name?: string;
  email: string;
  bookmarkedPosts?: string[];
}

export interface Comment {
  _id: string;
  userId: string; // or User object if populated
  userName: string;
  text: string;
  timestamp: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface AISummary {
  summary: string;
  hashtags: string[];
  mood: string;
  themes: string[];
  generatedAt: Date;
  summaryType: 'media' | 'cultural' | 'creative' | 'travel';
}

export interface MediaItem {
  _id: string;
  userId: string; // or User object
  uri: string;
  type: 'photo' | 'video';
  timestamp: number;
  aspectRatio?: number;
  title?: string;
  description?: string;
  likes: string[]; // Array of user IDs
  comments: Comment[];
  location?: Location;
  tags?: string[];
  aiSummary?: AISummary;
  // Other context fields can be added if needed
}

export interface Post {
  _id: string;
  userId: User; // Populated
  title?: string;
  description?: string;
  mediaItems: MediaItem[]; // Populated
  tags: string[];
  location?: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
    name?: string; // This is what PostCard seems to expect, but backend has it in MediaItem
  };
  likes: string[]; // Array of user IDs
  comments: Comment[];
  featured: boolean;
  visibility: 'public' | 'private' | 'community';
  aiSummary?: AISummary;
  createdAt: string; // Date string
  updatedAt: string; // Date string
}

export interface Space {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  timestamp: number;
  eventDate?: number;
  subscribers: string[];
}
