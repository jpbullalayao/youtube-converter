'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (sessionId && !downloadStarted) {
      setDownloadStarted(true);
      
      // Trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = `/api/download?session_id=${sessionId}`;
      downloadLink.download = '';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }, [sessionId, downloadStarted]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Analytics />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your download should start automatically. If it doesn&apos;t, please check your browser&apos;s download folder.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Convert Another Video
            </Link>
            
            {sessionId && (
              <div className="pt-4">
                <button
                  onClick={() => {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = `/api/download?session_id=${sessionId}`;
                    downloadLink.download = '';
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Download Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}