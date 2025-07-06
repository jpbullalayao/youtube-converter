'use client';

import { useState } from 'react';
import { getStripe } from '@/lib/stripe';

interface DownloadButtonProps {
  videoInfo: {
    title: string;
    thumbnail: string;
    duration: string;
    videoId: string;
  };
  format: 'mp4' | 'mp3';
  quality: string;
  url: string;
}

export const DownloadButton = ({ videoInfo, format, quality, url }: DownloadButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoInfo,
          format,
          quality,
          url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {isLoading ? 'Creating Checkout...' : `Download ${format.toUpperCase()} ${format === 'mp4' ? `(${quality})` : ''} - $0.49`}
      </button>
    </div>
  );
};