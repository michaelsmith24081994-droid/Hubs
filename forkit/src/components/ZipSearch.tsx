import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii, fonts } from '../theme/theme';
import { Coordinates } from '../hooks/useLocation';

type Props = {
  onResolved: (coords: Coordinates) => void;
};

type Status = 'idle' | 'loading' | 'error';

export function ZipSearch({ onResolved }: Props) {
  const [postcode, setPostcode] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async () => {
    const trimmed = postcode.trim();
    if (!trimmed) {
      return;
    }
    setStatus('loading');
    try {
      const encoded = encodeURIComponent(trimmed.replace(/\s+/g, ''));
      const response = await fetch(`https://api.postcodes.io/postcodes/${encoded}`);
      const data = await response.json();
      if (response.ok && data.result) {
        onResolved({ latitude: data.result.latitude, longitude: data.result.longitude });
        setStatus('idle');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SEARCH BY POSTCODE</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="e.g. SW1A 1AA"
          placeholderTextColor={colors.textSecondary}
          value={postcode}
          onChangeText={(text) => {
            setPostcode(text);
            setStatus('idle');
          }}
          autoCapitalize="characters"
          maxLength={8}
          onSubmitEditing={handleSubmit}
        />
        <Pressable
          style={({ hovered }) => [styles.goButton, hovered && styles.goButtonHover]}
          onPress={handleSubmit}
        >
          <Text style={styles.goButtonText}>{status === 'loading' ? '…' : 'Go'}</Text>
        </Pressable>
      </View>
      {status === 'error' && <Text style={styles.errorText}>Postcode not found — try again</Text>}
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
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.accent,
    marginTop: spacing.sm,
  },
});
