import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatDuration = (seconds: string | number): string => {
  const duration = parseInt(seconds.toString());
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const secs = duration % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const qualityOptions = [
  { value: '360p', label: '360p (Low Quality)' },
  { value: '480p', label: '480p (Standard Quality)' },
  { value: '720p', label: '720p (HD Quality)' },
  { value: '1080p', label: '1080p (Full HD)' },
];