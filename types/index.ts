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
  
  id: number;
  type: "image" | "video" | "livePhoto" | "pairedVideo" | undefined;
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
  fileSize?: number;
}

export interface Space {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  timestamp: number;
  eventDate?: number;
  subscribers: string[]; // User IDs
  // streamUrl?: string; // For live streaming
  // posts: MediaItem[]; // Or a separate collection for space-specific posts
}
export interface LocationData {
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface PostData {
  userId: string;
  mediaItems: MediaItem[];
  title: string;
  description: string;
  location: LocationData | null;
  visibility: 'public' | 'private' | 'friends';
  featured: boolean;
  comments: any[];
  aiSummary: any;
  culturalContext: any;
  creativeContext: any;
  travelContext: any;
}