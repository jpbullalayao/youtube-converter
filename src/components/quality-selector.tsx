'use client';

import { qualityOptions } from '@/lib/utils';

interface QualitySelectorProps {
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
}

export const QualitySelector = ({ selectedQuality, onQualityChange }: QualitySelectorProps) => {
  return (
    <div>
      <h5 className="text-lg font-semibold text-gray-900 mb-4">Video Quality</h5>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {qualityOptions.map((option) => (
          <label 
            key={option.value} 
            className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 ${
              selectedQuality === option.value
                ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/20'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="quality"
              value={option.value}
              checked={selectedQuality === option.value}
              onChange={(e) => onQualityChange(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-sm">{option.value}</div>
              <div className="text-xs text-gray-600">{option.label.split(' ').slice(1).join(' ')}</div>
            </div>
            {selectedQuality === option.value && (
              <div className="absolute -top-2 -right-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};