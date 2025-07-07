import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId, getVideoInfo } from '@/lib/youtube';
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

    console.log('=== YouTube URL Validation Debug ===');
    console.log('Original URL:', url);
    
    // Extract video ID from URL
    const videoId = extractVideoId(url);
    console.log('Extracted video ID:', videoId);
    
    if (!videoId) {
      console.log('Video ID extraction failed');
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.' },
        { status: 400 }
      );
    }

    // Construct a clean YouTube URL for ytdl-core
    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log('Clean URL for ytdl-core:', cleanUrl);
    
    try {
      console.log('Attempting to fetch video info...');
      console.log('Environment info:', {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV,
        userAgent: process.env.VERCEL_URL ? 'Vercel Environment' : 'Local Environment'
      });
      
      const videoInfo = await getVideoInfo(cleanUrl);
      console.log('Video info fetched successfully:', {
        title: videoInfo.title,
        videoId: videoInfo.videoId,
        thumbnailExists: !!videoInfo.thumbnail,
        duration: videoInfo.duration
      });
      
      // Additional validation to ensure we got proper data
      if (!videoInfo.title || videoInfo.title === 'Unknown Title') {
        console.warn('Warning: Video title is missing or unknown');
      }
      
      return NextResponse.json({
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        duration: formatDuration(videoInfo.duration),
        videoId: videoInfo.videoId,
      });
    } catch (videoError: unknown) {
      console.error('=== ytdl-core Error Details ===');
      console.error('Error type:', videoError instanceof Error ? videoError.constructor.name : typeof videoError);
      console.error('Error message:', videoError instanceof Error ? videoError.message : String(videoError));
      console.error('Error stack:', videoError instanceof Error ? videoError.stack : 'No stack trace');
      console.error('Full error object:', videoError);
      
      // Handle specific error types
      if (videoError instanceof Error) {
        if (videoError.message.includes('410') || videoError.message.includes('Status code: 410')) {
          return NextResponse.json(
            { error: 'This video is temporarily unavailable due to YouTube restrictions. Please try a different video or try again later.' },
            { status: 503 }
          );
        }
        
        if (videoError.message.includes('403') || videoError.message.includes('Forbidden')) {
          return NextResponse.json(
            { error: 'This video is restricted or private. Please check if the video is publicly accessible.' },
            { status: 403 }
          );
        }
        
        if (videoError.message.includes('404') || videoError.message.includes('Not Found')) {
          return NextResponse.json(
            { error: 'Video not found. Please check if the URL is correct and the video exists.' },
            { status: 404 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Unable to fetch video information. The video may be private, deleted, or temporarily unavailable.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}