import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radii, fonts } from '../theme/theme';
import { cuisineOptions } from '../data/mockRestaurants';
import { SidePanel } from './SidePanel';
import { CustomSlider } from './CustomSlider';

export type Preferences = {
  distanceMiles: number;
  openNow: boolean;
  cuisines: string[];
  minRating: number;
};

type Props = {
  visible: boolean;
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
  onClose: () => void;
};

export function PreferencesSheet({ visible, preferences, onChange, onClose }: Props) {
  const toggleCuisine = (cuisine: string) => {
    const isSelected = preferences.cuisines.includes(cuisine);
    onChange({
      ...preferences,
      cuisines: isSelected
        ? preferences.cuisines.filter((c) => c !== cuisine)
        : [...preferences.cuisines, cuisine],
    });
  };

  return (
    <SidePanel visible={visible} onClose={onClose} side="left">
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Preferences</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ hovered }) => [styles.closeButton, hovered && styles.closeButtonHover]}
          >
            <Feather name="x" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>DISTANCE</Text>
            <Text style={styles.valueLarge}>{preferences.distanceMiles} miles</Text>
            <CustomSlider
              minimumValue={2}
              maximumValue={20}
              step={1}
              value={preferences.distanceMiles}
              onValueChange={(value) => onChange({ ...preferences, distanceMiles: value })}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>2 mi</Text>
              <Text style={styles.sliderLabelText}>20 mi</Text>
            </View>

            <Text style={styles.label}>MIN RATING</Text>
            <Text style={styles.valueLarge}>{preferences.minRating.toFixed(1)}+ stars</Text>
            <CustomSlider
              minimumValue={0}
              maximumValue={4}
              step={0.5}
              value={preferences.minRating}
              onValueChange={(value) => onChange({ ...preferences, minRating: value })}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>Any</Text>
              <Text style={styles.sliderLabelText}>4.0+</Text>
            </View>

            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.label}>OPEN NOW</Text>
                <Text style={styles.helperText}>Hide restaurants that are currently closed</Text>
              </View>
              <Pressable
                style={({ hovered }) => [
                  styles.toggle,
                  preferences.openNow && styles.toggleOn,
                  hovered && !preferences.openNow && styles.toggleHover,
                ]}
                onPress={() => onChange({ ...preferences, openNow: !preferences.openNow })}
              >
                <View style={[styles.toggleKnob, preferences.openNow && styles.toggleKnobOn]} />
              </Pressable>
            </View>

            <Text style={[styles.label, { marginTop: spacing.lg }]}>CUISINES</Text>
            <Text style={styles.helperText}>
              {preferences.cuisines.length === 0
                ? 'Showing all cuisines'
                : `${preferences.cuisines.length} selected`}
            </Text>
            <View style={styles.chipRow}>
              {cuisineOptions.map((cuisine) => {
                const selected = preferences.cuisines.includes(cuisine);
                return (
                  <Pressable
                    key={cuisine}
                    style={({ hovered }) => [
                      styles.chip,
                      selected && styles.chipSelected,
                      hovered && !selected && styles.chipHover,
                    ]}
                    onPress={() => toggleCuisine(cuisine)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {cuisine}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
        </ScrollView>

        <Pressable
          style={({ hovered }) => [styles.doneButton, hovered && styles.doneButtonHover]}
          onPress={onClose}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    </SidePanel>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.accent,
  },
  closeButton: {
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
  },
  closeButtonHover: {
    opacity: 0.6,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  valueLarge: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sliderLabelText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  helperText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
  },
  toggleOn: {
    backgroundColor: colors.accent,
  },
  toggleHover: {
    backgroundColor: colors.textSecondary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
  },
  toggleKnobOn: {
    backgroundColor: colors.textOnAccent,
    transform: [{ translateX: 20 }],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chipBackground,
    borderRadius: radii.chip,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    transitionProperty: 'border-color',
    transitionDuration: '150ms',
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipHover: {
    borderColor: colors.accent,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.textOnAccent,
  },
  doneButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
  },
  doneButtonHover: {
    opacity: 0.85,
  },
  doneButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.textOnAccent,
  },
});
