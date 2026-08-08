import styles from '@/styles/styles';
import React from 'react';
import { View } from 'react-native';

export interface StepProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export default function StepProgressBar({
  currentStep,
  totalSteps = 3,
}: StepProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View className="flex-row gap-3 mb-5">
      {steps.map((stepNum) => (
        <View
        style={[
          currentStep >= stepNum ? styles.InnerShadowStyle : styles.InnerShadowStyle,
        ]}
          key={stepNum}
          className={`flex-1 h-2.5 rounded-[13px] ${
            currentStep >= stepNum ? 'bg-[#4086F7]' : 'bg-[#D3E1FD]'
          }`}
        />
      ))}
    </View>
  );
} 
