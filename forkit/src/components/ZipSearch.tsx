import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii, fonts } from '../theme/theme';

type Props = {
  onSubmit: (zip: string) => void;
};

export function ZipSearch({ onSubmit }: Props) {
  const [postcode, setPostcode] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SEARCH BY POSTCODE</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="e.g. SW1A 1AA"
          placeholderTextColor={colors.textSecondary}
          value={postcode}
          onChangeText={setPostcode}
          autoCapitalize="characters"
          maxLength={8}
        />
        <Pressable
          style={({ hovered }) => [styles.goButton, hovered && styles.goButtonHover]}
          onPress={() => onSubmit(postcode)}
        >
          <Text style={styles.goButtonText}>Go</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  goButton: {
    flexShrink: 0,
    backgroundColor: colors.accent,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
  },
  goButtonHover: {
    opacity: 0.85,
  },
  goButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textOnAccent,
  },
});
