import { NextRequest, NextResponse } from 'next/server';
import { validateYouTubeURL, getVideoInfo } from '@/lib/youtube';
import { formatDuration } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!validateYouTubeURL(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const videoInfo = await getVideoInfo(url);
    
    return NextResponse.json({
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      duration: formatDuration(videoInfo.duration),
      videoId: videoInfo.videoId,
    });
  } catch (error) {
    console.error('Error validating YouTube URL:', error);
    return NextResponse.json(
      { error: 'Failed to validate YouTube URL' },
      { status: 500 }
    );
  }
}