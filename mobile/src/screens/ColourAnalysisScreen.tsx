import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';

import ShareCard from '../components/ShareCard';
import { analyseSeasonFromAverageRgb } from '../features/colourAnalysis/analyseSeason';
import { averageRgbFromImageUri } from '../features/colourAnalysis/imageSampling';
import { SEASONS, type SeasonData } from '../features/colourAnalysis/seasons';
import { useAuth } from '../../context/AuthContext';
import { loadColourAnalysis, saveColourAnalysis } from '../../lib/colourAnalysisStorage';

type ResultState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; uri: string; season: keyof typeof SEASONS; brightness: number; warmth: number }
  | { status: 'error'; message: string };

type ReadyResult = Extract<ResultState, { status: 'ready' }>;

function ColourResultsBody({ result, seasonData }: { result: ReadyResult; seasonData: SeasonData }) {
  return (
    <View style={styles.results}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsLabel}>Your season</Text>
        <Text style={styles.seasonName}>{result.season}</Text>
        <Text style={styles.seasonTagline}>{seasonData.tagline}</Text>
        <Text style={styles.metrics}>
          Brightness: {result.brightness.toFixed(2)} · Warmth: {result.warmth.toFixed(2)}
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Colours to wear</Text>
          <Text style={styles.cardSubtitle}>These harmonise with your natural colouring.</Text>
          <View style={styles.swatchGrid}>
            {seasonData.wear.map((s) => (
              <View key={`wear-${s.hex}-${s.name}`} style={[styles.swatch, { backgroundColor: s.hex }]}>
                <Text style={styles.swatchTop}>{s.name}</Text>
                <Text style={styles.swatchMeta}>
                  {s.hex.toUpperCase()} · {s.note}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Colours to avoid</Text>
          <Text style={styles.cardSubtitle}>These may overpower or dull your features.</Text>
          <View style={styles.swatchGrid}>
            {seasonData.avoid.map((s) => (
              <View key={`avoid-${s.hex}-${s.name}`} style={[styles.swatch, { backgroundColor: s.hex }]}>
                <Text style={styles.swatchTop}>{s.name}</Text>
                <Text style={styles.swatchMeta}>
                  {s.hex.toUpperCase()} · {s.note}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        This uses a lightweight (mock) model based on average image colour, ported from your web demo.
      </Text>

      <ShareCard />
    </View>
  );
}

export function ColourAnalysisScreen() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [result, setResult] = useState<ResultState>({ status: 'idle' });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  const seasonData = useMemo(() => {
    if (result.status !== 'ready') return null;
    return SEASONS[result.season];
  }, [result]);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!userId) {
        setRestoredFromStorage(true);
        return;
      }
      const saved = await loadColourAnalysis(userId);
      if (cancelled || !saved) {
        setRestoredFromStorage(true);
        return;
      }
      setResult({
        status: 'ready',
        uri: saved.photoUri,
        season: saved.season,
        brightness: saved.brightness,
        warmth: saved.warmth,
      });
      setImageUri(saved.photoUri);
      setRestoredFromStorage(true);
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to choose an image.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (res.canceled) return;
    const uri = res.assets?.[0]?.uri;
    if (!uri) return;
    setImageUri(uri);
    setResult({ status: 'idle' });
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      cameraType: ImagePicker.CameraType.front,
    });

    if (res.canceled) return;
    const uri = res.assets?.[0]?.uri;
    if (!uri) return;
    setImageUri(uri);
    setResult({ status: 'idle' });
  }

  async function runAnalysis() {
    if (!imageUri) return;
    setResult({ status: 'loading' });

    try {
      const avg = await averageRgbFromImageUri(imageUri, { size: 80 });
      const analysis = analyseSeasonFromAverageRgb(avg);

      let displayUri = imageUri;
      if (userId) {
        const sourceFile = new File(imageUri);
        const destFile = new File(Paths.document, `colour_analysis_${userId}.jpg`);
        sourceFile.copy(destFile);
        displayUri = destFile.uri;
        await saveColourAnalysis(userId, {
          season: analysis.season,
          brightness: analysis.brightness,
          warmth: analysis.warmth,
          photoUri: displayUri,
        });
      }

      setImageUri(displayUri);
      setResult({
        status: 'ready',
        uri: displayUri,
        season: analysis.season,
        brightness: analysis.brightness,
        warmth: analysis.warmth,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong during analysis.';
      setResult({ status: 'error', message });
    }
  }

  if (!restoredFromStorage) {
    return (
      <View style={styles.centerShell}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (result.status === 'ready' && seasonData) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>Your colour results</Text>
        <Text style={styles.p}>
          Your seasonal palette and colour guidance from your photo analysis.
        </Text>
        {result.uri ? (
          <Image source={{ uri: result.uri }} style={styles.resultsHeroImage} />
        ) : null}
        <ColourResultsBody result={result} seasonData={seasonData} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>AI Colour Analysis</Text>
      <Text style={styles.p}>
        Upload or take a photo and discover your seasonal palette. For best results: hair off your face, soft daylight,
        no makeup/glasses/accessories.
      </Text>

      <View style={styles.actionsRow}>
        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={pickFromLibrary}>
          <Text style={styles.buttonText}>Choose photo</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={takePhoto}>
          <Text style={styles.buttonText}>Use camera</Text>
        </Pressable>
      </View>

      <View style={styles.previewShell}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderTitle}>No photo yet</Text>
            <Text style={styles.previewPlaceholderBody}>Upload or capture a photo to begin.</Text>
          </View>
        )}

        <Pressable
          style={[styles.button, styles.buttonPrimary, !imageUri && styles.buttonDisabled]}
          onPress={runAnalysis}
          disabled={!imageUri || result.status === 'loading'}
        >
          <Text style={styles.buttonText}>
            {result.status === 'loading' ? 'Analysing…' : 'Analyse my colours'}
          </Text>
        </Pressable>

        {result.status === 'loading' ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Analysing undertones, depth and contrast…</Text>
          </View>
        ) : null}

        {result.status === 'error' ? <Text style={styles.errorText}>{result.message}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerShell: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1220',
  },
  container: {
    padding: 18,
    paddingBottom: 34,
    backgroundColor: '#0b1220',
  },
  h1: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  p: {
    color: '#cbd5e1',
    marginTop: 10,
    lineHeight: 18,
    fontSize: 13,
  },
  resultsHeroImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    marginTop: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  previewShell: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 14,
  },
  previewPlaceholder: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  previewPlaceholderTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  previewPlaceholderBody: {
    marginTop: 6,
    color: '#cbd5e1',
    fontSize: 12,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonPrimary: {
    marginTop: 12,
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(148,163,184,0.35)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 13,
  },
  loadingRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  errorText: {
    marginTop: 10,
    color: '#fb7185',
    fontSize: 12,
  },
  results: {
    marginTop: 18,
  },
  resultsHeader: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.35)',
    backgroundColor: 'rgba(99,102,241,0.10)',
  },
  resultsLabel: {
    color: 'rgba(248,250,252,0.75)',
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  seasonName: {
    marginTop: 4,
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },
  seasonTagline: {
    marginTop: 6,
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  metrics: {
    marginTop: 10,
    color: 'rgba(203,213,225,0.8)',
    fontSize: 12,
  },
  grid: {
    marginTop: 12,
    gap: 12,
  },
  card: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cardTitle: {
    color: '#f8fafc',
    fontWeight: '800',
    fontSize: 14,
  },
  cardSubtitle: {
    marginTop: 4,
    color: '#cbd5e1',
    fontSize: 12,
  },
  swatchGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    width: '31%',
    minHeight: 74,
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
    justifyContent: 'space-between',
  },
  swatchTop: {
    color: '#0b1220',
    fontSize: 11,
    fontWeight: '800',
  },
  swatchMeta: {
    color: 'rgba(2,6,23,0.78)',
    fontSize: 10,
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 14,
    color: 'rgba(203,213,225,0.8)',
    fontSize: 11,
    lineHeight: 16,
  },
});
