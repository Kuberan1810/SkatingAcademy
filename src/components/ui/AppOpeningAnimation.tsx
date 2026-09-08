import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AppOpeningAnimationProps {
  onFinish?: () => void;
  duration?: number;
}

export default function AppOpeningAnimation({
  onFinish,
  duration = 1800,
}: AppOpeningAnimationProps) {
  const [isFinished, setIsFinished] = useState(false);
  const hasStartedRef = useRef(false);

  // Animation values
  const containerOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(14);
  const loaderWidth = useSharedValue(0);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore if haptics unavailable
    }

    // 1. Smooth Logo Entrance (Calm & Elegant)
    logoOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
    logoScale.value = withSpring(1, {
      damping: 15,
      mass: 0.9,
      stiffness: 90,
    });

    // 2. Text Fade-in & subtle slide
    textOpacity.value = withDelay(250, withTiming(1, { duration: 450 }));
    textTranslateY.value = withDelay(
      250,
      withSpring(0, { damping: 18, stiffness: 90 })
    );

    // 3. Smooth Progress Bar (pacing over 1.2s)
    loaderWidth.value = withDelay(
      300,
      withTiming(100, {
        duration: Math.max(duration - 600, 600),
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      })
    );

    // 4. Smooth Gentle Fade Out
    const timer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(setIsFinished)(true);
          if (onFinish) {
            runOnJS(onFinish)();
          }
        }
      });
    }, Math.max(duration - 350, 0));

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const loaderStyle = useAnimatedStyle(() => ({
    width: `${loaderWidth.value}%`,
  }));

  if (isFinished) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      pointerEvents={isFinished ? 'none' : 'auto'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Center Branding Block */}
      <View style={styles.centerBlock}>
        {/* NSA Logo Card */}
        <Animated.View style={[styles.iconWrapper, logoStyle]}>
          <Image
            source={require('@/assets/images/nsa-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Clean Typography */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.title}>National Skating Academy</Text>
          <Text style={styles.subtitle}>Instructor Portal</Text>
        </Animated.View>
      </View>

      {/* Minimal Bottom Line Loader */}
      <View style={styles.bottomLoaderWrapper}>
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderFill, loaderStyle]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill as any,
    zIndex: 999999,
    elevation: 999999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#F2EEF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  logoImage: {
    width: 76,
    height: 76,
    borderRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 24,
    color: '#18181B',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#8E8E93',
    letterSpacing: 0.2,
  },
  bottomLoaderWrapper: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  loaderTrack: {
    width: 56,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: '#F67300',
    borderRadius: 2,
  },
});
