import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BodyShape } from '../src/features/styleAnalysis/types';

const PREFIX = 'styla_style_analysis_v1';

export type StyleAnalysisPersisted = {
  step: 0 | 1 | 2 | 3;
  /** Optional label for the client this report will be exported for (shows in PDF/UI). */
  clientDisplayName?: string;
  answers: {
    shoulders_answer?: string;
    waist_answer?: string;
    hips_answer?: string;
    face_answer?: string;
    jawline_answer?: string;
    wrist_answer?: string;
    height_answer?: string;
    shoeSize_answer?: string;
    bodyShape?: BodyShape;
  };
  report: string | null;
};

function storageKey(consultantAuthId: string) {
  return `${PREFIX}_${consultantAuthId}`;
}

export async function loadStyleAnalysis(consultantAuthId: string): Promise<StyleAnalysisPersisted | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(consultantAuthId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StyleAnalysisPersisted;
    if (typeof parsed.step !== 'number' || parsed.step < 0 || parsed.step > 3) return null;
    return {
      step: parsed.step as 0 | 1 | 2 | 3,
      clientDisplayName: typeof parsed.clientDisplayName === 'string' ? parsed.clientDisplayName : undefined,
      answers: parsed.answers ?? {},
      report: typeof parsed.report === 'string' ? parsed.report : null,
    };
  } catch {
    return null;
  }
}

export async function saveStyleAnalysis(consultantAuthId: string, data: StyleAnalysisPersisted): Promise<void> {
  await AsyncStorage.setItem(storageKey(consultantAuthId), JSON.stringify(data));
}
