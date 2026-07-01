import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts } from '../theme/theme';

export function LoadingScreen() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.overlay}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons name="restaurant" size={48} color={colors.accent} />
      </Animated.View>
      <Text style={styles.title}>Scouting your next favorite spot</Text>
      <Text style={styles.subtext}>Good taste takes a few seconds…</Text>
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
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  subtext: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
