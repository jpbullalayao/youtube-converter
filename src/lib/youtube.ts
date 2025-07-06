import ytdl from 'ytdl-core';

export const validateYouTubeURL = (url: string): boolean => {
  return ytdl.validateURL(url);
};

export const getVideoInfo = async (url: string) => {
  try {
    const info = await ytdl.getInfo(url);
    return {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0]?.url,
      duration: info.videoDetails.lengthSeconds,
      videoId: info.videoDetails.videoId,
    };
  } catch {
    throw new Error('Failed to fetch video information');
  }
};

export const getVideoStream = (url: string, quality?: string) => {
  const options: ytdl.downloadOptions = {
    quality: quality || 'highestvideo',
  };
  return ytdl(url, options);
};

export const getAudioStream = (url: string) => {
  return ytdl(url, { 
    quality: 'highestaudio',
  });
};