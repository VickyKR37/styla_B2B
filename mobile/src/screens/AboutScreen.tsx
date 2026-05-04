import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootNavigationParamList } from '../../navigationRef';

import packageJson from '../../package.json';

type Props = NativeStackScreenProps<RootNavigationParamList, 'About'>;

const PRIVACY_URL = 'https://styla.me/privacy';
const TERMS_URL = 'https://styla.me/terms';

export function AboutScreen(_props: Props) {
  async function openUrl(url: string) {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>App Identity</Text>

      <View style={styles.row}>
        <Text style={styles.label}>App Name</Text>
        <Text style={styles.value}>Styla</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Version</Text>
        <Text style={styles.value}>{packageJson.version}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Developed by</Text>
        <Text style={styles.value}>Rai Tech Solutions</Text>
      </View>

      <Text style={[styles.h1, styles.sectionSpacer]}>Legal & Business Information</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Trading Name</Text>
        <Text style={styles.value}>Rai Tech Solutions</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Registered Address</Text>
        <Text style={styles.value}>
          52 Mornington Crescent, Hounslow, Middlesex, United Kingdom, TW5 9SS
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Contact Email</Text>
        <Pressable onPress={() => void openUrl('mailto:support@styla.me')}>
          <Text style={styles.link}>support@styla.me</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Country of Operation</Text>
        <Text style={styles.value}>United Kingdom</Text>
      </View>

      <Text style={[styles.h2, styles.sectionSpacer]}>Privacy & terms</Text>
      <View style={styles.linkRow}>
        <Pressable onPress={() => void openUrl(PRIVACY_URL)}>
          <Text style={styles.link}>Privacy policy</Text>
        </Pressable>
        <Text style={styles.bullet}> • </Text>
        <Pressable onPress={() => void openUrl(TERMS_URL)}>
          <Text style={styles.link}>Terms & conditions</Text>
        </Pressable>
      </View>

      <Text style={[styles.h2, styles.sectionSpacer]}>App description</Text>
      <Text style={styles.body}>
        Styla is your personal colour and style analysis tool. Discover your unique colour season, receive a
        personalised palette, and unlock style recommendations tailored just for you.
      </Text>

      <Text style={[styles.h2, styles.sectionSpacer]}>Support</Text>
      <Text style={styles.body}>
        For help or queries, contact us at{' '}
        <Text style={styles.linkInline} onPress={() => void openUrl('mailto:support@styla.me')}>
          support@styla.me
        </Text>
        .
      </Text>

      <Text style={styles.copyright}>© 2026 Rai Tech Solutions. All rights reserved.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  h1: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2A',
    marginBottom: 14,
  },
  h2: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2A',
    marginBottom: 8,
  },
  sectionSpacer: {
    marginTop: 22,
  },
  row: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2C2C2A',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  link: {
    fontSize: 15,
    color: '#C4956A',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  linkInline: {
    color: '#C4956A',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  bullet: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  copyright: {
    marginTop: 28,
    fontSize: 12,
    color: '#6B7280',
  },
});
