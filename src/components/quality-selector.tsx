'use client';

import { qualityOptions } from '@/lib/utils';

interface QualitySelectorProps {
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
}

export const QualitySelector = ({ selectedQuality, onQualityChange }: QualitySelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Video Quality
      </label>
      <div className="grid grid-cols-2 gap-2">
        {qualityOptions.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="radio"
              name="quality"
              value={option.value}
              checked={selectedQuality === option.value}
              onChange={(e) => onQualityChange(e.target.value)}
              className="mr-2"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};