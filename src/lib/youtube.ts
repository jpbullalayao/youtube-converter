import { Innertube } from 'youtubei.js';

export const extractVideoId = (url: string): string | null => {
  try {
    // Remove any whitespace
    const cleanUrl = url.trim();
    
    // Handle various YouTube URL formats
    const patterns = [
      // Standard watch URLs: youtube.com/watch?v=VIDEO_ID
      /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
      // Short URLs: youtu.be/VIDEO_ID
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      // Embed URLs: youtube.com/embed/VIDEO_ID
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      // Mobile URLs: m.youtube.com/watch?v=VIDEO_ID
      /(?:m\.youtube\.com\/watch\?v=|m\.youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
      // YouTube Shorts: youtube.com/shorts/VIDEO_ID
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      // Music URLs: music.youtube.com/watch?v=VIDEO_ID
      /(?:music\.youtube\.com\/watch\?v=|music\.youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no pattern matches, try URL parsing as fallback
    const urlObj = new URL(cleanUrl);
    if (urlObj.searchParams.has('v')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId && videoId.length === 11) {
        return videoId;
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

export const validateYouTubeURL = (url: string): boolean => {
  return extractVideoId(url) !== null;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

export const getVideoInfo = async (url: string) => {
  try {
    console.log('youtubei.js getBasicInfo called with URL:', url);
    
    // Extract video ID from URL for youtubei.js
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Could not extract video ID from URL');
    }
    
    console.log('Creating Innertube instance...');
    
    // Create Innertube instance with enhanced configuration for Vercel
    const innertube = await retryWithBackoff(async () => {
      return await Innertube.create({
        visitor_data: undefined,
        enable_session_cache: false,
        // Add custom user agent to bypass bot detection
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      });
    });
    
    console.log('Making getBasicInfo request for video ID:', videoId);
    
    // Add retry logic with exponential backoff for the API call
    const info = await retryWithBackoff(async () => {
      const result = await innertube.getBasicInfo(videoId);
      
      // Validate that we actually got meaningful data
      if (!result.basic_info || (!result.basic_info.title && !result.basic_info.short_description)) {
        throw new Error('YouTube returned empty video info - likely blocked by bot detection');
      }
      
      return result;
    }, 3, 2000);
    
    console.log('getBasicInfo successful, video details:', {
      title: info.basic_info.title,
      videoId: info.basic_info.id,
      duration: info.basic_info.duration,
      thumbnailCount: info.basic_info.thumbnail?.length || 0,
      hasShortDescription: !!info.basic_info.short_description
    });
    
    return {
      title: info.basic_info.title || 'Unknown Title',
      thumbnail: info.basic_info.thumbnail?.[0]?.url || '',
      duration: typeof info.basic_info.duration === 'number' ? info.basic_info.duration : 0,
      videoId: info.basic_info.id || videoId,
    };
  } catch (error) {
    console.error('youtubei.js getBasicInfo failed:', error);
    throw error; // Re-throw the original error for better debugging
  }
};

export const getVideoStream = async (url: string, quality?: string) => {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Could not extract video ID from URL');
    }
    
    const innertube = await retryWithBackoff(async () => {
      return await Innertube.create({
        visitor_data: undefined,
        enable_session_cache: false,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      });
    });
    
    const info = await retryWithBackoff(async () => {
      return await innertube.getBasicInfo(videoId);
    });
    
    // Choose format based on quality preference
    const format = info.chooseFormat({ 
      type: 'video+audio', 
      quality: quality || 'best' 
    });
    
    if (!format) {
      throw new Error(`No video format found for quality: ${quality || 'best'}`);
    }
    
    return format;
  } catch (error) {
    console.error('getVideoStream failed:', error);
    throw error;
  }
};

export const getAudioStream = async (url: string) => {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Could not extract video ID from URL');
    }
    
    const innertube = await retryWithBackoff(async () => {
      return await Innertube.create({
        visitor_data: undefined,
        enable_session_cache: false,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      });
    });
    
    const info = await retryWithBackoff(async () => {
      return await innertube.getBasicInfo(videoId);
    });
    
    // Choose audio format
    const format = info.chooseFormat({ 
      type: 'audio', 
      quality: 'best' 
    });
    
    if (!format) {
      throw new Error('No audio format found');
    }
    
    return format;
  } catch (error) {
    console.error('getAudioStream failed:', error);
    throw error;
  }
};