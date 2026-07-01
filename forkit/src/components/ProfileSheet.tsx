import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fonts } from '../theme/theme';
import { SidePanel } from './SidePanel';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ProfileSheet({ visible, onClose }: Props) {
  return (
    <SidePanel visible={visible} onClose={onClose} side="right">
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Profile</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ hovered }) => [styles.closeButton, hovered && styles.closeButtonHover]}
          >
            <Feather name="x" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Saved Places</Text>
        <Text style={styles.emptyText}>No saved restaurants yet</Text>
        <Text style={styles.emptySubtext}>
          Start exploring restaurants to build your taste profile!
        </Text>
      </View>
    </SidePanel>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
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
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
