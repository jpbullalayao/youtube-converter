import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube to MP4 & MP3 Converter - Fast & Easy Downloads",
  description: "Convert YouTube videos to MP4 or MP3 instantly. High-quality downloads in 360p, 480p, 720p, 1080p. No ads, no popups, secure checkout. Only $0.50 per download.",
  keywords: "youtube to mp4, youtube to mp3, youtube converter, video downloader, audio converter, youtube download",
  openGraph: {
    title: "YouTube to MP4 & MP3 Converter - Fast & Easy Downloads",
    description: "Convert YouTube videos to MP4 or MP3 instantly. High-quality downloads in 360p, 480p, 720p, 1080p. No ads, no popups, secure checkout. Only $0.50 per download.",
    type: "website",
    url: "https://youtube-converter-tan.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to MP4 & MP3 Converter - Fast & Easy Downloads",
    description: "Convert YouTube videos to MP4 or MP3 instantly. High-quality downloads in 360p, 480p, 720p, 1080p. No ads, no popups, secure checkout. Only $0.50 per download.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://youtube-converter-tan.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'YouTube to MP4 & MP3 Converter',
              description: 'Convert YouTube videos to MP4 or MP3 instantly. High-quality downloads in 360p, 480p, 720p, 1080p. No ads, no popups, secure checkout.',
              url: 'https://youtube-converter-tan.vercel.app',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0.50',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
