export interface User {
  id: string;
  name?: string;
  email: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface MediaItem {
  id: string; // Will be MongoDB ObjectId
  uri: string; // URL from cloud storage
  type: 'photo' | 'video';
  timestamp: number;
  aspectRatio?: number;
  userId: string; // ID of the user who uploaded
  title?: string; // Optional title for the media
  description?: string; // Optional description
  likes: string[]; // Array of user IDs who liked
  comments: Comment[];
  geminiStory?: {
    [language: string]: string; // e.g., { en: "Story in English", bn: "বাংলা গল্প" }
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  tags?: string[];
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
