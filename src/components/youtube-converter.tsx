'use client';

import { useState } from 'react';
import { QualitySelector } from './quality-selector';
import { DownloadButton } from './download-button';

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
    <div className="max-w-4xl mx-auto">
      {/* Main Converter Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 lg:p-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Start Your Download
          </h2>
          <p className="text-gray-600 text-lg">
            Paste your YouTube URL below and choose your preferred format
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-6">
            <label htmlFor="youtube-url" className="block text-sm font-semibold text-gray-800 mb-3">
              YouTube URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="url"
                id="youtube-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Convert
              </div>
            )}
          </button>
        </form>

        {videoInfo && (
          <div className="border-t-2 border-gray-100 pt-8">
            {/* Video Preview */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full lg:w-48 h-32 lg:h-28 object-cover rounded-xl shadow-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">{videoInfo.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Duration: {videoInfo.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Ready to convert
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Format</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                  selectedFormat === 'mp4' 
                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/20' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="format"
                    value="mp4"
                    checked={selectedFormat === 'mp4'}
                    onChange={(e) => setSelectedFormat(e.target.value as 'mp4')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">MP4 Video</div>
                      <div className="text-sm text-gray-600">Full video with audio</div>
                    </div>
                  </div>
                </label>

                <label className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                  selectedFormat === 'mp3' 
                    ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-500/20' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="format"
                    value="mp3"
                    checked={selectedFormat === 'mp3'}
                    onChange={(e) => setSelectedFormat(e.target.value as 'mp3')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">MP3 Audio</div>
                      <div className="text-sm text-gray-600">Audio only file</div>
                    </div>
                  </div>
                </label>
              </div>

              {selectedFormat === 'mp4' && (
                <div className="mt-6">
                  <QualitySelector
                    selectedQuality={selectedQuality}
                    onQualityChange={setSelectedQuality}
                  />
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-green-900 mb-1">Secure Payment Process</h5>
                  <p className="text-green-800">
                    You&apos;ll be redirected to Stripe&apos;s secure checkout to complete your $0.50 payment. 
                    Your download will begin automatically after successful payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <DownloadButton
                  videoInfo={videoInfo}
                  format={selectedFormat}
                  quality={selectedQuality}
                  url={url}
                />
              </div>
              <button
                onClick={resetForm}
                className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Convert Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};