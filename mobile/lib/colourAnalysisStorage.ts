import AsyncStorage from '@react-native-async-storage/async-storage';

import { SEASONS, type SeasonKey } from '../src/features/colourAnalysis/seasons';

const PREFIX = 'styla_colour_analysis_v1';

export type PersistedColourAnalysis = {
  season: SeasonKey;
  brightness: number;
  warmth: number;
  /** Copied image under FileSystem.documentDirectory */
  photoUri: string;
};

function storageKey(userId: string) {
  return `${PREFIX}_${userId}`;
}

function isSeasonKey(value: unknown): value is SeasonKey {
  return typeof value === 'string' && value in SEASONS;
}

export async function loadColourAnalysis(userId: string): Promise<PersistedColourAnalysis | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedColourAnalysis>;
    if (
      !isSeasonKey(parsed.season) ||
      typeof parsed.brightness !== 'number' ||
      typeof parsed.warmth !== 'number' ||
      typeof parsed.photoUri !== 'string'
    ) {
      return null;
    }
    return {
      season: parsed.season,
      brightness: parsed.brightness,
      warmth: parsed.warmth,
      photoUri: parsed.photoUri,
    };
  } catch {
    return null;
  }
}

export async function saveColourAnalysis(userId: string, data: PersistedColourAnalysis): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(data));
}
