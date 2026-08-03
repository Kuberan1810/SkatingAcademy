import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export default function ScreenWrapper({ children, style, className }: ScreenWrapperProps) {
  return (
    <LinearGradient
      colors={['#E9E5FE', '#FFFFFF']}
      start={{ x: 0.6, y: 0 }}
      end={{ x: 0, y: 0.5 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView 
        className={`flex-1 ${className || ''}`}
        style={style}
        edges={['top', 'left', 'right']}
      >
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}
