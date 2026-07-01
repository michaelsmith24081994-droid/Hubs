import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../theme/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  children: React.ReactNode;
};

export function SidePanel({ visible, onClose, side, children }: Props) {
  const panelWidth = Math.min(360, Dimensions.get('window').width * 0.86);
  const offscreenX = side === 'left' ? -panelWidth : panelWidth;
  const [mounted, setMounted] = useState(visible);
  const translateX = useRef(new Animated.Value(offscreenX)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: offscreenX,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) {
    return null;
  }

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.panel,
            side === 'left' ? styles.panelLeft : styles.panelRight,
            { width: panelWidth, transform: [{ translateX }] },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.surface,
  },
  panelLeft: {
    left: 0,
  },
  panelRight: {
    right: 0,
  },
});
