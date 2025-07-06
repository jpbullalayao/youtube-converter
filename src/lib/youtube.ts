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

export const getVideoInfo = async (url: string) => {
  try {
    console.log('youtubei.js getBasicInfo called with URL:', url);
    
    // Extract video ID from URL for youtubei.js
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Could not extract video ID from URL');
    }
    
    console.log('Creating Innertube instance...');
    const innertube = await Innertube.create();
    
    console.log('Making getBasicInfo request for video ID:', videoId);
    const info = await innertube.getBasicInfo(videoId);
    
    console.log('getBasicInfo successful, video details:', {
      title: info.basic_info.title,
      videoId: info.basic_info.id,
      duration: info.basic_info.duration,
      thumbnailCount: info.basic_info.thumbnail?.length || 0
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
    
    const innertube = await Innertube.create();
    const info = await innertube.getBasicInfo(videoId);
    
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
    
    const innertube = await Innertube.create();
    const info = await innertube.getBasicInfo(videoId);
    
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