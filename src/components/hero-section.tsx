'use client';

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          {/* <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 backdrop-blur-sm">
            <span className="text-sm font-medium text-blue-700">
              ✨ No ads, no popups, just clean downloads
            </span>
          </div> */}
          
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Convert YouTube videos to{' '}<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MP4 & MP3{' '}
              </span>
              {/* <br /> */}
              in seconds
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Fast, reliable YouTube video conversion. 
              No ads, no popups, no hidden links. Pay once, download instantly.
            </p>
          </div>
          
          {/* Price Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200/50 backdrop-blur-sm">
            <span className="text-lg font-semibold text-green-700">
              💰 Only $0.50 per download
            </span>
          </div>
          
          {/* Features Row */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Multiple quality options</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Secure Stripe payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Instant downloads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};