import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { FAQ_URL } from '../constants/externalLinks';
import { navigateToAbout } from '../../navigationRef';

const EXTERNAL_LINKS = [
  { label: 'Terms & Conditions', url: 'https://styla.me/terms' },
  { label: 'Privacy Policy', url: 'https://styla.me/privacy' },
] as const;

export function LegalLinksFooter() {
  async function openLink(url: string) {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }

  return (
    <View style={styles.footer}>
      <View style={styles.linksRow}>
        <View style={styles.linkRow}>
          <Pressable onPress={navigateToAbout}>
            <Text style={styles.linkText}>About</Text>
          </Pressable>
          <Text style={styles.separator}>•</Text>
        </View>
        <View style={styles.linkRow}>
          <Pressable onPress={() => openLink(FAQ_URL)}>
            <Text style={styles.linkText}>FAQ</Text>
          </Pressable>
          <Text style={styles.separator}>•</Text>
        </View>
        {EXTERNAL_LINKS.map((link, index) => (
          <View key={link.label} style={styles.linkRow}>
            <Pressable onPress={() => openLink(link.url)}>
              <Text style={styles.linkText}>{link.label}</Text>
            </Pressable>
            {index < EXTERNAL_LINKS.length - 1 ? <Text style={styles.separator}>•</Text> : null}
          </View>
        ))}
      </View>
      <Pressable onPress={() => openLink('mailto:support@styla.me')}>
        <Text style={styles.emailText}>support@styla.me</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FAF8F5',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#6B7280',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginHorizontal: 4,
  },
  separator: {
    color: '#9CA3AF',
    marginHorizontal: 2,
    fontSize: 12,
  },
  emailText: {
    color: '#6B7280',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginTop: 6,
  },
});
