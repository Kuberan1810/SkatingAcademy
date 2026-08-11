import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export default function ScreenWrapper({ children, style, className }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#EDFBFF', '#FFFFFF']}
      start={{ x: 0.6, y: 0 }}
      end={{ x: 0, y: 0.5 }}
      style={{ flex: 1 }}
    >
      <View 
        className={`flex-1 ${className || ''}`}
        style={[style, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}
