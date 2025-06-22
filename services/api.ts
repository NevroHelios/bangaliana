import { MediaItem } from '@/types/index'; // Assuming types are centralized
import * as FileSystem from 'expo-file-system';
// import { API_BASE_URL } from '@/config/config';

const FAS_FAST_URL = "https://testing-80wh.onrender.com" // for fast api testing

const API_BASE_URL = "http://192.168.174.91:10000"
// Accepts audioUri (file path), sends as file in FormData
export const getAudioTranscription = async (audioUri: string): Promise<string> => {
  try {
    console.log('[getAudioTranscription] Called');
    console.log('[getAudioTranscription] audioUri:', audioUri);

    // Read file as blob
    let fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist at provided URI');
    }

    // For React Native/Expo, FormData expects { uri, name, type }
    const fileName = audioUri.split('/').pop() || `audio_${Date.now()}.wav`;
    const fileType = 'audio/wav'; // Adjust if needed

    const formData = new FormData();
    // Backend expects field name 'audio', not 'file'
    formData.append('audio', {
      uri: audioUri,
      name: fileName,
      type: fileType,
    } as any);

    const response = await fetch(`${FAS_FAST_URL}/get_transcript`, {
      method: 'POST', 
      headers: {
        // 'Content-Type' should NOT be set for FormData in React Native
      },
      body: formData,
    });

    console.log('[getAudioTranscription] Response status:', response.status);

    const text = await response.text();
    console.log('[getAudioTranscription] Response text:', text);

    if (!response.ok) {
      throw new Error(`[getAudioTranscription] Bad response: ${response.status} - ${text}`);
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error('[getAudioTranscription] Failed to parse JSON:', e);
      throw new Error('Invalid JSON response');
    }

    console.log('[getAudioTranscription] Parsed result:', result);
    // Return only the transcript string
    return result.data;
  } catch (err) {
    console.error('[getAudioTranscription] Error:', err);
    throw err;
  }
};


export const getHomeFast = async (): Promise<string> => {
  try {
    const response = await fetch(`${FAS_FAST_URL}/`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch home: ${response.status} ${response.statusText} - ${text}`);
    }
    return response.text();
  } catch (err: any) {
    console.error('Error fetching from FastAPI backend:', err);
    console.log('Is the FastAPI backend running at', FAS_FAST_URL, '?');
    throw new Error('Could not connect to FastAPI backend. Is it running and accessible?');
  }
}


// --- Media ---
export const fetchMediaItems = async (token?: string): Promise<MediaItem[]> => {
  const response = await fetch(`${API_BASE_URL}/media`, { headers: { 'Authorization': `Bearer ${token || ''}` } });
  if (!response.ok) throw new Error('Failed to fetch media');
  return response.json();
};


export const uploadMediaItem = async (formData: FormData, token?: string): Promise<MediaItem> => {
  const response = await fetch(`${API_BASE_URL}/media`, { 
    method: 'POST', 
    body: formData, 
    headers: { 'Authorization': `Bearer ${token || ''}` } 
  });
  if (!response.ok) throw new Error('Failed to upload media');
  return response.json();
};

export const deleteMediaItem = async (mediaId: string, token?: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}`, { 
    method: 'DELETE', 
    headers: { 'Authorization': `Bearer ${token || ''}` } 
  });
  if (!response.ok) throw new Error('Failed to delete media');
  return; 
};

// --- Gemini ---
export const generateStoryWithGemini = async (mediaId: string, prompt: string, language: 'en' | 'bn', token?: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}/generate-story`, { 
    method: 'POST', 
    body: JSON.stringify({ prompt, language }), 
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}` 
    } 
  });
  if (!response.ok) throw new Error('Failed to generate story');
  const data = await response.json();
  return data.story;
};

// --- Likes ---
export const likeMediaItem = async (mediaId: string, token?: string): Promise<MediaItem> => {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token || ''}` }
  });
  if (!response.ok) throw new Error('Failed to like media item');
  return response.json();
};

export const unlikeMediaItem = async (mediaId: string, token?: string): Promise<MediaItem> => {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}/unlike`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token || ''}` }
  });
  if (!response.ok) throw new Error('Failed to unlike media item');
  return response.json();
};




