import type { SeasonKey } from './seasons';

export type RGB = { r: number; g: number; b: number };

export type SeasonAnalysis = {
  season: SeasonKey;
  brightness: number; // 0..1
  warmth: number; // approx -1..1
  rgbAvg: RGB;
};

function clamp255(value: number) {
  return Math.max(0, Math.min(255, value));
}

// Port of mockAnalyseSeasonFromImage() in https://github.com/VickyKR37/colour_analysis/blob/main/script.js
export function analyseSeasonFromAverageRgb(rgb: RGB): SeasonAnalysis {
  const rAvg = clamp255(rgb.r);
  const gAvg = clamp255(rgb.g);
  const bAvg = clamp255(rgb.b);

  const brightness = (rAvg + gAvg + bAvg) / (3 * 255);
  const warmth = (rAvg - bAvg) / 255;

  let season: SeasonKey;
  if (brightness > 0.6 && warmth > 0.08) season = 'Spring';
  else if (brightness > 0.6 && warmth <= 0.08) season = 'Summer';
  else if (brightness <= 0.6 && warmth > 0.05) season = 'Autumn';
  else season = 'Winter';

  return {
    season,
    brightness,
    warmth,
    rgbAvg: { r: rAvg, g: gAvg, b: bAvg },
  };
}

