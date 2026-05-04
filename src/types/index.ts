

export interface LineAnswer {
  bodyPart: 'Shoulders' | 'Waist' | 'Hips' | 'Face' | 'Jawline';
  answer: string;
  classification: 'straight' | 'curved';
}

export interface ScaleAnswer {
  category: 'Wrist Circumference' | 'Height' | 'Shoe Size';
  answer: string;
}

export interface QuestionnaireData {
  lineAnswers: LineAnswer[];
  scaleAnswers: ScaleAnswer[];
  bodyShape: 'Pear Shape' | 'Inverted Triangle' | 'Straight' | 'Round/Apple' | 'Hourglass' | '';
  // preferences removed as per previous request
}

export interface UserReportData {
  recommendations: string;
  questionnaireData: QuestionnaireData;
  /** Where the consultant asked us to email the finished report (often the client inbox). */
  recipientEmail?: string;
  /** Optional display name for metadata if you later persist per-client rows server-side. */
  clientDisplayName?: string;
  generatedAtClient?: string;
}
