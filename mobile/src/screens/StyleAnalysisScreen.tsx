import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import { GOOGLE_PLAY_REVIEW_URL } from '../constants/externalLinks';
import { useAuth } from '../../context/AuthContext';
import { loadStyleAnalysis, saveStyleAnalysis } from '../../lib/styleAnalysisStorage';
import { generateLogicBasedReport } from '../features/styleAnalysis/generateLogicBasedReport';
import type {
  BodyShape,
  LineAnswer,
  QuestionnaireData,
  ScaleAnswer,
} from '../features/styleAnalysis/types';

type Step = 0 | 1 | 2 | 3;

const stepTitles: string[] = [
  'Line Analysis (Part 1)',
  'Line Analysis (Part 2)',
  'Scale Assessment',
  'Horizontal Proportion (Body Shape)',
];

type QuestionnaireFormState = {
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

const lineOptions = {
  shoulders: [
    { value: 'straight', label: 'Straight', classification: 'straight' as const },
    { value: 'sloping', label: 'Sloping', classification: 'curved' as const },
  ],
  waist: [
    { value: 'defined', label: 'Defined', classification: 'curved' as const },
    { value: 'undefined', label: 'Undefined', classification: 'straight' as const },
  ],
  hips: [
    { value: 'flared', label: 'Flared', classification: 'curved' as const },
    { value: 'straight', label: 'Straight', classification: 'straight' as const },
  ],
  face: [
    { value: 'straight/thin lips', label: 'Straight/thin lips', classification: 'straight' as const },
    { value: 'curved/full lips', label: 'Curved/full lips', classification: 'curved' as const },
  ],
  jawline: [
    { value: 'curved', label: 'Curved', classification: 'curved' as const },
    { value: 'angular', label: 'Angular', classification: 'straight' as const },
  ],
} as const;

const scaleOptions = {
  wrist: [
    { value: 'Small - 5.5” (14cm) or less', label: 'Small - 5.5” (14cm) or less' },
    { value: 'Medium - 5.5 – 6.5” (14-16cm)', label: 'Medium - 5.5 – 6.5” (14-16cm)' },
    { value: 'Large 6.5 (16.5cm) or more', label: 'Large 6.5 (16.5cm) or more' },
  ],
  height: [
    { value: "Small - Under 5’3” (1.6m)", label: "Small - Under 5’3” (1.6m)" },
    { value: 'Medium - 5’3” – 5’8” (1.6-1.72m)', label: 'Medium - 5’3” – 5’8” (1.6-1.72m)' },
    { value: 'Large – 5’8” (1.72m) and over', label: 'Large – 5’8” (1.72m) and over' },
  ],
  shoeSize: [
    { value: 'Small – 35 – 37', label: 'Small – 35 – 37' },
    { value: 'Medium – 38 - 39', label: 'Medium – 38 - 39' },
    { value: 'Large – 40+', label: 'Large – 40+' },
  ],
} as const;

const bodyShapeOptions: Array<{ name: BodyShape; description: string }> = [
  {
    name: 'Pear Shape',
    description:
      'Smaller upper body with narrow shoulders and/or a petite bust. The waist is defined, leading to broader hips.',
  },
  {
    name: 'Inverted Triangle',
    description:
      'Shoulders are wider than the hips, often accompanied by a fuller bust and a shorter waist.',
  },
  {
    name: 'Straight',
    description:
      'Hips and shoulders are aligned with little to no waist definition, creating a straight silhouette.',
  },
  {
    name: 'Round/Apple',
    description:
      'Fullness throughout with a less defined waist, creating a naturally curvy outline.',
  },
  {
    name: 'Hourglass',
    description:
      'Balanced proportions between shoulders and hips with a well-defined waist (atleast 10 inches smaller than shoulders/hips).',
  },
];

function getClassification(bodyPart: keyof typeof lineOptions, answer: string): LineAnswer['classification'] {
  const option = lineOptions[bodyPart].find((opt) => opt.value === answer);
  return option ? option.classification : 'straight';
}

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextDefault]}>
        {label}
      </Text>
    </Pressable>
  );
}

function isReportHeading(line: string): boolean {
  const headingPattern = /^(Line Analysis Summary|Scale Assessment Summary|Body Shape:|Your Dominant|Styling Strategy|Fabrics & Patterns|Clothing Specifics|Avoid:)/i;
  return headingPattern.test(line) || (/^[A-Z][A-Za-z\s&/()-]+:$/.test(line) && !line.startsWith('- '));
}

export function StyleAnalysisScreen() {
  const { user } = useAuth();
  const consultantAuthId = user?.id ?? null;

  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<QuestionnaireFormState>({});
  const [clientDisplayName, setClientDisplayName] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  const progress = useMemo(() => ((step + 1) / 4) * 100, [step]);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!consultantAuthId) {
        // Stay "not hydrated" until we have an auth id; avoids save effect running early with wrong flags.
        setRestoredFromStorage(false);
        return;
      }
      const saved = await loadStyleAnalysis(consultantAuthId);
      if (cancelled) return;
      if (saved) {
        setStep(saved.step);
        setClientDisplayName(saved.clientDisplayName ?? '');
        setAnswers(saved.answers);
        setReport(saved.report);
      }
      setRestoredFromStorage(true);
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [consultantAuthId]);

  useEffect(() => {
    if (!consultantAuthId || !restoredFromStorage) return;
    const handle = setTimeout(() => {
      void saveStyleAnalysis(consultantAuthId, { step, clientDisplayName, answers, report });
    }, 500);
    return () => clearTimeout(handle);
  }, [consultantAuthId, restoredFromStorage, step, clientDisplayName, answers, report]);

  function reportForLabel(): string {
    const t = clientDisplayName.trim();
    return t.length > 0 ? t : 'Client';
  }

  function validateClientNameForReport(): boolean {
    if (clientDisplayName.trim().length === 0) {
      Alert.alert('Client name needed', 'Enter your client’s name (or a short label). It appears on the exported report.');
      return false;
    }
    return true;
  }
  function setAnswer<K extends keyof QuestionnaireFormState>(key: K, value: QuestionnaireFormState[K]) {
    setAnswers((prev: QuestionnaireFormState) => ({ ...prev, [key]: value }));
  }

  function validateCurrentStep(): boolean {
    if (step === 0) {
      if (!answers.shoulders_answer || !answers.waist_answer || !answers.hips_answer) return false;
    }
    if (step === 1) {
      if (!answers.face_answer || !answers.jawline_answer) return false;
    }
    if (step === 2) {
      if (!answers.wrist_answer || !answers.height_answer || !answers.shoeSize_answer) return false;
    }
    if (step === 3) {
      if (!answers.bodyShape) return false;
    }
    return true;
  }

  function buildQuestionnaireData(): QuestionnaireData {
    if (!answers.bodyShape) throw new Error('Missing body shape');

    const lineAnswers: LineAnswer[] = [
      {
        bodyPart: 'Shoulders',
        answer: answers.shoulders_answer || '',
        classification: getClassification('shoulders', answers.shoulders_answer || ''),
      },
      {
        bodyPart: 'Waist',
        answer: answers.waist_answer || '',
        classification: getClassification('waist', answers.waist_answer || ''),
      },
      {
        bodyPart: 'Hips',
        answer: answers.hips_answer || '',
        classification: getClassification('hips', answers.hips_answer || ''),
      },
      {
        bodyPart: 'Face',
        answer: answers.face_answer || '',
        classification: getClassification('face', answers.face_answer || ''),
      },
      {
        bodyPart: 'Jawline',
        answer: answers.jawline_answer || '',
        classification: getClassification('jawline', answers.jawline_answer || ''),
      },
    ];

    const scaleAnswers: ScaleAnswer[] = [
      { category: 'Wrist Circumference', answer: answers.wrist_answer || '' },
      { category: 'Height', answer: answers.height_answer || '' },
      { category: 'Shoe Size', answer: answers.shoeSize_answer || '' },
    ];

    return {
      lineAnswers,
      scaleAnswers,
      bodyShape: answers.bodyShape,
    };
  }

  async function onProceed() {
    if (report) return;
    if (!validateCurrentStep()) {
      Alert.alert('Missing answers', 'Please select an option for the questions on this step.');
      return;
    }

    if (step < 3) {
      setStep((prev: Step) => ((prev + 1) as Step));
      return;
    }

    if (!validateClientNameForReport()) {
      return;
    }

    setIsGenerating(true);
    try {
      const data = buildQuestionnaireData();
      const generated = generateLogicBasedReport(data);
      setReport(generated);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not generate this client report.';
      Alert.alert('Error', message);
    } finally {
      setIsGenerating(false);
    }
  }

  function onBack() {
    if (report) return;
    if (step > 0) setStep((prev: Step) => ((prev - 1) as Step));
  }

  function escapeHtml(rawText: string): string {
    return rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildPdfHtml(reportText: string, preparedForLabel: string): string {
    const reportLines = reportText.split('\n').map((line) => line.trim());
    let contentHtml = '';

    for (const rawLine of reportLines) {
      if (!rawLine) {
        contentHtml += '<div class="spacer"></div>';
        continue;
      }
      if (rawLine === '---') {
        contentHtml += '<hr />';
        continue;
      }
      if (rawLine.startsWith('- ')) {
        contentHtml += `<p class="bullet">${escapeHtml(rawLine.slice(2))}</p>`;
        continue;
      }
      if (isReportHeading(rawLine)) {
        contentHtml += `<h2>${escapeHtml(rawLine)}</h2>`;
        continue;
      }
      contentHtml += `<p>${escapeHtml(rawLine)}</p>`;
    }

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #1e293b; padding: 24px; line-height: 1.6; }
      h1 { font-size: 24px; margin: 0 0 8px 0; color: #6366f1; }
      .meta-report { font-size: 15px; color: #334155; margin: 0 0 14px 0; font-weight: 600; }
      h2 { font-size: 16px; margin: 14px 0 6px 0; color: #6366f1; }
      p { margin: 0 0 6px 0; white-space: normal; font-size: 13px; }
      p.bullet { margin-left: 14px; }
      p.bullet::before { content: "• "; color: #4f46e5; }
      .spacer { height: 6px; }
      hr { border: none; border-top: 1px solid #cbd5e1; margin: 10px 0; }
      p.closing { margin-top: 22px; padding-top: 14px; border-top: 1px solid #cbd5e1; font-size: 13px; color: #334155; }
    </style>
  </head>
  <body>
    <h1>Style Report</h1>
    <p class="meta-report">${escapeHtml(`Report for: ${preparedForLabel}`)}</p>
    ${contentHtml}
    <p class="closing">${escapeHtml(
      'Now you know exactly what works for you. If Styla delivered — tell someone. Leave a review on Google Play and help another woman stop guessing.',
    )}</p>
  </body>
</html>`;
  }

  async function onDownloadPdf() {
    if (!report || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const { uri } = await Print.printToFileAsync({
        html: buildPdfHtml(report, reportForLabel()),
      });
      const sourceFile = new File(uri);
      // Unique name so repeat downloads don’t fail when the previous PDF still exists in cache.
      const targetFile = new File(Paths.cache, `style-report-${Date.now()}.pdf`);
      sourceFile.copy(targetFile);
      const targetUri = targetFile.uri;
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        Alert.alert('PDF ready', `The client report PDF was created at:\n${targetUri}`);
        return;
      }
      await Sharing.shareAsync(targetUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or send PDF',
        UTI: '.pdf',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create the client PDF.';
      Alert.alert('PDF error', message);
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function onLeaveReview() {
    const supported = await Linking.canOpenURL(GOOGLE_PLAY_REVIEW_URL);
    if (supported) {
      await Linking.openURL(GOOGLE_PLAY_REVIEW_URL);
    }
  }

  if (report) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        <Text style={styles.reportTitle}>Style report</Text>
        <Text style={styles.reportClientLine}>Report for: {reportForLabel()}</Text>
        <Text style={styles.reportIntro}>
          Based on the observations and answers you captured for this client, here is the style analysis.
        </Text>

        <Pressable
          style={[
            styles.primaryButton,
            styles.reportDownloadButton,
            isDownloadingPdf ? styles.disabledButton : null,
          ]}
          onPress={onDownloadPdf}
          disabled={isDownloadingPdf}
        >
          <Text style={styles.primaryButtonText}>
            {isDownloadingPdf ? 'Preparing PDF…' : 'Download client PDF'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, styles.reportReviewButton]}
          onPress={() => void onLeaveReview()}
        >
          <Text style={styles.secondaryButtonText}>Leave a Review</Text>
        </Pressable>

        <View style={styles.reportShell}>
          <ScrollView
            style={styles.reportScroll}
            contentContainerStyle={styles.reportScrollContent}
            nestedScrollEnabled
          >
            {report.split('\n').map((rawLine: string, index: number) => {
              const line = rawLine.trim();
              if (!line) {
                return <View key={`space-${index}`} style={styles.reportSpacer} />;
              }
              if (line === '---') {
                return <View key={`divider-${index}`} style={styles.reportDivider} />;
              }
              if (line.startsWith('- ')) {
                return (
                  <Text key={`bullet-${index}`} selectable style={styles.reportBullet}>
                    {'\u2022'} {line.slice(2)}
                  </Text>
                );
              }
              if (isReportHeading(line)) {
                return (
                  <Text key={`heading-${index}`} selectable style={styles.reportHeading}>
                    {line}
                  </Text>
                );
              }
              return (
                <Text key={`line-${index}`} selectable style={styles.reportText}>
                  {line}
                </Text>
              );
            })}
          </ScrollView>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            styles.reportDownloadButton,
            styles.reportActionsRepeatTop,
            isDownloadingPdf ? styles.disabledButton : null,
          ]}
          onPress={onDownloadPdf}
          disabled={isDownloadingPdf}
        >
          <Text style={styles.primaryButtonText}>
            {isDownloadingPdf ? 'Preparing PDF…' : 'Download client PDF'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, styles.reportReviewButton]}
          onPress={() => void onLeaveReview()}
        >
          <Text style={styles.secondaryButtonText}>Leave a Review</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
    >
      <Text style={styles.title}>Client style report</Text>
      <Text style={styles.body}>
        Work through this questionnaire on behalf of your client. The narrative in the final report stays warm and
        personal for her; your job here is to record accurate line, scale, and body-shape details.
      </Text>

      <Text style={styles.clientNameLabel}>Client name</Text>
      {!restoredFromStorage ? (
        <Text style={styles.hydrationHint}>Loading saved draft…</Text>
      ) : null}
      <TextInput
        style={styles.clientNameInput}
        value={clientDisplayName}
        onChangeText={setClientDisplayName}
        placeholder="Shown on the exported report"
        placeholderTextColor="rgba(148,163,184,0.75)"
        editable={restoredFromStorage && !report}
        autoCapitalize="words"
        selectionColor="#a5b4fc"
      />
      <Text style={styles.clientNameHint}>Required before you generate the PDF.</Text>

      <View style={styles.progressShell}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.stepTitle}>{stepTitles[step]}</Text>
      {step === 3 ? (
        <Text style={[styles.questionHint, styles.stepHint]}>
          In front of a full-length mirror, your client should wear something you can clearly see her shape in. Hold
          the metre stick beside her shoulder and let it drop straight down.
        </Text>
      ) : null}

      {step === 0 ? (
        <View style={styles.stepBlock}>
          <Text style={styles.questionLabel}>Shoulders</Text>
          <View style={styles.chipRow}>
            {lineOptions.shoulders.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={answers.shoulders_answer === opt.value}
                onPress={() => setAnswer('shoulders_answer', opt.value)}
              />
            ))}
          </View>

          <Text style={styles.questionLabel}>Waist</Text>
          <View style={styles.chipRow}>
            {lineOptions.waist.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={answers.waist_answer === opt.value}
                onPress={() => setAnswer('waist_answer', opt.value)}
              />
            ))}
          </View>

          <Text style={styles.questionLabel}>Hips</Text>
          <View style={styles.chipRow}>
            {lineOptions.hips.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={answers.hips_answer === opt.value}
                onPress={() => setAnswer('hips_answer', opt.value)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.stepBlock}>
          <Text style={styles.questionLabel}>Face (Lips)</Text>
          <View style={styles.chipRow}>
            {lineOptions.face.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={answers.face_answer === opt.value}
                onPress={() => setAnswer('face_answer', opt.value)}
              />
            ))}
          </View>

          <Text style={styles.questionLabel}>Jawline</Text>
          <View style={styles.chipRow}>
            {lineOptions.jawline.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={answers.jawline_answer === opt.value}
                onPress={() => setAnswer('jawline_answer', opt.value)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.stepBlock}>
          <Text style={styles.questionLabel}>Wrist Circumference</Text>
          <View style={styles.chipRow}>
            {scaleOptions.wrist.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={answers.wrist_answer === opt.value}
                onPress={() => setAnswer('wrist_answer', opt.value)}
              />
            ))}
          </View>

          <Text style={styles.questionLabel}>Height</Text>
          <View style={styles.chipRow}>
            {scaleOptions.height.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={answers.height_answer === opt.value}
                onPress={() => setAnswer('height_answer', opt.value)}
              />
            ))}
          </View>

          <Text style={styles.questionLabel}>Shoe Size</Text>
          <Text style={styles.questionHint}>European sizing</Text>
          <View style={styles.chipRow}>
            {scaleOptions.shoeSize.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={answers.shoeSize_answer === opt.value}
                onPress={() => setAnswer('shoeSize_answer', opt.value)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.stepBlock}>
          {bodyShapeOptions.map((opt) => (
            <Pressable
              key={opt.name}
              style={[
                styles.bodyShapeCard,
                answers.bodyShape === opt.name ? styles.bodyShapeCardSelected : null,
              ]}
              onPress={() => setAnswer('bodyShape', opt.name)}
            >
              <Text style={[styles.bodyShapeTitle, answers.bodyShape === opt.name ? styles.bodyShapeTitleSelected : null]}>
                {opt.name}
              </Text>
              <Text style={styles.bodyShapeDescription}>{opt.description}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <Pressable
          style={[styles.secondaryButton, step === 0 ? styles.disabledButton : null]}
          onPress={onBack}
          disabled={step === 0 || isGenerating}
        >
          <Text style={styles.secondaryButtonText}>Previous</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryButton, isGenerating ? styles.disabledButton : null]}
          onPress={onProceed}
          disabled={isGenerating}
        >
          <Text style={styles.primaryButtonText}>
            {isGenerating ? 'Generating…' : step < 3 ? 'Next' : 'Generate client report'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 34,
    backgroundColor: '#0b1220',
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
  },
  body: {
    color: '#cbd5e1',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  progressShell: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.25)',
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  stepTitle: {
    marginTop: 14,
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  stepBlock: {
    marginTop: 12,
    gap: 14,
  },
  questionLabel: {
    color: 'rgba(248,250,252,0.9)',
    fontSize: 13,
    fontWeight: '800',
  },
  questionHint: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: -8,
  },
  stepHint: {
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(148,163,184,0.35)',
  },
  chipSelected: {
    backgroundColor: 'rgba(99,102,241,0.25)',
    borderColor: 'rgba(99,102,241,0.85)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  chipTextDefault: {
    color: '#e5e7eb',
  },
  chipTextSelected: {
    color: '#f8fafc',
  },
  bodyShapeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    gap: 6,
  },
  bodyShapeCardSelected: {
    borderColor: 'rgba(99,102,241,0.9)',
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  bodyShapeTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },
  bodyShapeTitleSelected: {
    color: '#ffffff',
  },
  bodyShapeDescription: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#6366f1',
    borderWidth: 1,
    borderColor: '#6366f1',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontWeight: '900',
    fontSize: 13,
  },
  secondaryButton: {
    width: 130,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#cbd5e1',
    fontWeight: '900',
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.55,
  },
  reportDownloadButton: {
    marginTop: 14,
    alignSelf: 'stretch',
    flexGrow: 0,
    flexShrink: 0,
  },
  reportReviewButton: {
    marginTop: 10,
    alignSelf: 'stretch',
    width: '100%',
  },
  reportActionsRepeatTop: {
    marginTop: 14,
  },
  reportShell: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.78)',
    padding: 14,
  },
  reportTitle: {
    color: '#6366f1',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 6,
  },
  reportClientLine: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  clientNameLabel: {
    marginTop: 16,
    color: 'rgba(248,250,252,0.9)',
    fontSize: 13,
    fontWeight: '800',
  },
  hydrationHint: {
    marginTop: 4,
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  clientNameInput: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#f8fafc',
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  clientNameHint: {
    marginTop: 6,
    color: '#94a3b8',
    fontSize: 12,
  },
  reportIntro: {
    color: '#cbd5e1',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
  },
  reportScroll: {
    maxHeight: 620,
  },
  reportScrollContent: {
    paddingBottom: 8,
  },
  reportText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  reportHeading: {
    color: '#6366f1',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 2,
  },
  reportBullet: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
    marginLeft: 8,
    marginBottom: 3,
  },
  reportSpacer: {
    height: 6,
  },
  reportDivider: {
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.35)',
    marginVertical: 8,
  },
});

