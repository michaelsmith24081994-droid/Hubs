import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radii, fonts } from '../theme/theme';
import { Restaurant } from '../data/mockRestaurants';

type Props = {
  restaurant: Restaurant;
  onTryAgain: () => void;
  onClose: () => void;
};

export function ResultCard({ restaurant, onTryAgain, onClose }: Props) {
  return (
    <View style={styles.overlay}>
      <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12}>
        <Feather name="x" size={26} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.card}>
        <Image source={{ uri: restaurant.photoUrl }} style={styles.photo} />
        <View style={styles.info}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.meta}>
            {restaurant.cuisine} · {'$'.repeat(restaurant.priceLevel)} · {restaurant.distanceMiles} mi
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={16} color={colors.accent} />
            <Text style={styles.rating}>{restaurant.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.address}>{restaurant.address}</Text>

          <View style={styles.actionsRow}>
            <Pressable style={styles.actionButtonOutline}>
              <Feather name="phone" size={16} color={colors.textPrimary} />
              <Text style={styles.actionOutlineText}>Call</Text>
            </Pressable>
            <Pressable style={styles.actionButtonOutline}>
              <Feather name="map" size={16} color={colors.textPrimary} />
              <Text style={styles.actionOutlineText}>Directions</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable style={styles.tryAgainButton} onPress={onTryAgain}>
        <Feather name="refresh-cw" size={18} color={colors.textOnAccent} />
        <Text style={styles.tryAgainText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xxl,
    right: spacing.lg,
    zIndex: 1,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 220,
  },
  info: {
    padding: spacing.lg,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  rating: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  address: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
  },
  actionOutlineText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  tryAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    width: '100%',
  },
  tryAgainText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.textOnAccent,
  },
});
