import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, radii, fonts } from '../theme/theme';
import { PreferencesSheet, Preferences } from '../components/PreferencesSheet';
import { ProfileSheet } from '../components/ProfileSheet';
import { ResultCard } from '../components/ResultCard';
import { ZipSearch } from '../components/ZipSearch';
import { mockRestaurants, Restaurant } from '../data/mockRestaurants';

const defaultPreferences: Preferences = {
  distanceMiles: 5,
  openNow: true,
  cuisines: [],
  minRating: 0,
};

export function HomeScreen() {
  const [preferencesVisible, setPreferencesVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [zipVisible, setZipVisible] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [result, setResult] = useState<Restaurant | null>(null);

  const pickRandomRestaurant = () => {
    const pick = mockRestaurants[Math.floor(Math.random() * mockRestaurants.length)];
    setResult(pick);
  };

  if (result) {
    return (
      <ResultCard
        restaurant={result}
        onTryAgain={pickRandomRestaurant}
        onClose={() => setResult(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.topBar}>
        <Pressable onPress={() => setPreferencesVisible(true)} hitSlop={12}>
          <Feather name="sliders" size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.logo}>forkit</Text>
        <Pressable onPress={() => setProfileVisible(true)} hitSlop={12}>
          <Feather name="user" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.center}>
        <Text style={styles.headline}>Where should{'\n'}we eat?</Text>
        <Text style={styles.subtext}>One tap. One restaurant. No overthinking.</Text>

        <Pressable style={styles.ctaButton} onPress={pickRandomRestaurant}>
          <Text style={styles.ctaText}>Find Something Good</Text>
        </Pressable>
      </View>

      {zipVisible && (
        <View style={styles.zipContainer}>
          <ZipSearch onSubmit={() => setZipVisible(false)} />
        </View>
      )}

      <Pressable style={styles.locationFab} onPress={() => setZipVisible((prev) => !prev)}>
        <Feather name="map-pin" size={20} color={colors.textPrimary} />
      </Pressable>

      <PreferencesSheet
        visible={preferencesVisible}
        preferences={preferences}
        onChange={setPreferences}
        onClose={() => setPreferencesVisible(false)}
      />
      <ProfileSheet visible={profileVisible} onClose={() => setProfileVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  logo: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.accent,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 48,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtext: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  ctaButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.textOnAccent,
  },
  zipContainer: {
    position: 'absolute',
    bottom: spacing.xxl + 64,
    right: spacing.lg,
    width: 240,
  },
  locationFab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
