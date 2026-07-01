import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

type Props = {
  minimumValue: number;
  maximumValue: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
};

export function CustomSlider({ minimumValue, maximumValue, step, value, onValueChange }: Props) {
  const trackRef = useRef<View>(null);
  const layoutRef = useRef({ pageX: 0, width: 0 });

  const measureTrack = () => {
    trackRef.current?.measure((_x, _y, width, _height, pageX) => {
      layoutRef.current = { pageX, width };
    });
  };

  const updateFromPageX = (pageX: number) => {
    const { pageX: trackX, width } = layoutRef.current;
    if (width <= 0) return;
    const ratio = Math.min(Math.max((pageX - trackX) / width, 0), 1);
    const rawValue = minimumValue + ratio * (maximumValue - minimumValue);
    const stepped = Math.round(rawValue / step) * step;
    const clamped = Math.min(Math.max(stepped, minimumValue), maximumValue);
    onValueChange(Number(clamped.toFixed(2)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_evt, gestureState) => {
        updateFromPageX(gestureState.x0);
        measureTrack();
      },
      onPanResponderMove: (_evt, gestureState) => {
        updateFromPageX(gestureState.moveX);
      },
    })
  ).current;

  const percent =
    maximumValue > minimumValue
      ? ((value - minimumValue) / (maximumValue - minimumValue)) * 100
      : 0;

  return (
    <View style={styles.wrapper}>
      <View
        ref={trackRef}
        style={styles.hitArea}
        onLayout={measureTrack}
        {...panResponder.panHandlers}
      >
        <View style={styles.track} />
        <View style={[styles.filledTrack, { width: `${percent}%` }]} />
        <View style={[styles.thumb, { left: `${percent}%` }]} />
      </View>
    </View>
  );
}

const THUMB_SIZE = 20;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 32,
    justifyContent: 'center',
  },
  hitArea: {
    height: 32,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  filledTrack: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.accent,
    marginLeft: -THUMB_SIZE / 2,
    top: 16 - THUMB_SIZE / 2,
  },
});
