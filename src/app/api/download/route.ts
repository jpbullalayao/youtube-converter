import { NextRequest, NextResponse } from 'next/server';
import { getVideoStream, getAudioStream } from '@/lib/youtube';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const { videoInfo, format, quality, url } = session.metadata!;
    const parsedVideoInfo = JSON.parse(videoInfo);

    const filename = `${parsedVideoInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
    
    if (format === 'mp4') {
      const videoStream = getVideoStream(url, quality);
      
      return new Response(videoStream as unknown as ReadableStream, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else if (format === 'mp3') {
      const audioStream = getAudioStream(url);
      
      return new Response(audioStream as unknown as ReadableStream, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}