import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleProp, ViewStyle } from 'react-native';
import styles from '@/styles/styles';

export interface FigmaSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  borderColor?: string;
  knobColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Reusable 44x24 Figma-styled Toggle Switch component.
 * Exact match for Figma spec: 44x24 dimensions, #E1E2ED off fill, #F2EEF4 border, inset shadow, 18x18 white knob.
 */
export default function FigmaSwitch({
  value,
  onValueChange,
  activeColor = '#05773F',
  inactiveColor = '#E1E2ED',
  borderColor = '#F2EEF4',
  knobColor = '#FFFFFF',
  disabled = false,
  style,
  className = '',
}: FigmaSwitchProps) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const knobTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 20],
  });

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[
          styles.BlackInnerShadowStyle,
          {
            backgroundColor,
            borderColor,
          },
          style,
        ]}
        className={`w-[44px] h-[24px] rounded-full border justify-center ${className}`}
      >
        <Animated.View
          style={{
            transform: [{ translateX: knobTranslateX }],
            backgroundColor: knobColor,
          }}
          className="w-[20px] h-[18px] rounded-full shadow-sm"
        />
      </Animated.View>
    </Pressable>
  );
}
