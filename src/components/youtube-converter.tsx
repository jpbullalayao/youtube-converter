'use client';

import { useState } from 'react';
import { QualitySelector } from './quality-selector';
import { DownloadButton } from './download-button';
import { validateYouTubeURL } from '@/lib/youtube';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  videoId: string;
}

export const YouTubeConverter = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'mp3'>('mp4');
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeURL(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/validate-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate URL');
      }

      setVideoInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setVideoInfo(null);
    setError('');
    setSelectedFormat('mp4');
    setSelectedQuality('720p');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          YouTube to MP4 & MP3 Converter
        </h1>
        <p className="text-gray-600">
          Simply convert YouTube videos to downloadable MP4 video or MP3 audio files. 
          No ads, no pop-ups, no hidden links. Only pay $0.49 per download.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL
          </label>
          <input
            type="url"
            id="youtube-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Validating...' : 'Validate URL'}
        </button>
      </form>

      {videoInfo && (
        <div className="border-t pt-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-full sm:w-32 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{videoInfo.title}</h3>
                <p className="text-sm text-gray-600">Duration: {videoInfo.duration}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="mp4"
                  checked={selectedFormat === 'mp4'}
                  onChange={(e) => setSelectedFormat(e.target.value as 'mp4')}
                  className="mr-2"
                />
                MP4 Video
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="mp3"
                  checked={selectedFormat === 'mp3'}
                  onChange={(e) => setSelectedFormat(e.target.value as 'mp3')}
                  className="mr-2"
                />
                MP3 Audio
              </label>
            </div>

            {selectedFormat === 'mp4' && (
              <QualitySelector
                selectedQuality={selectedQuality}
                onQualityChange={setSelectedQuality}
              />
            )}
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Secure Payment:</strong> You&apos;ll be redirected to Stripe&apos;s secure checkout 
              to complete your $0.49 payment. Your download will begin automatically after successful payment.
            </p>
          </div>

          <div className="flex gap-4">
            <DownloadButton
              videoInfo={videoInfo}
              format={selectedFormat}
              quality={selectedQuality}
              url={url}
            />
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Convert Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};