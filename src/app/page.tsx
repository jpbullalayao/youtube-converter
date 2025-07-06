import { YouTubeConverter } from '@/components/youtube-converter';
import { HeroSection } from '@/components/hero-section';
import { Analytics } from '@vercel/analytics/next';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Analytics />
      <HeroSection />
      
      {/* Main Converter Section */}
      <div className="relative -mt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <YouTubeConverter />
      </div>
      
      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Converter?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the fastest, most secure, and reliable YouTube conversion service available.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Convert and download your videos in seconds, not minutes. Our optimized servers ensure maximum speed.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Secure</h3>
              <p className="text-gray-600">
                Your payments are processed through Stripe&apos;s secure infrastructure. We never store your personal data.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v16a1 1 0 01-1 1h-2a1 1 0 01-1-1V4m0 0H7m0 0v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">All Devices</h3>
              <p className="text-gray-600">
                Works perfectly on desktop, mobile, and tablet. Download your files anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
