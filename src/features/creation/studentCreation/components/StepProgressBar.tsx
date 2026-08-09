import styles from '@/styles/styles';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';

export interface StepProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  onStepPress?: (step: number) => void;
}

export default function StepProgressBar({
  currentStep,
  totalSteps = 3,
  onStepPress,
}: StepProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View className="flex-row gap-3 mb-5">
      {steps.map((stepNum) => {
        const bar = (
          <View
            style={[styles.InnerShadowStyle]}
            key={stepNum}
            className={`w-full h-2.5 rounded-[13px] ${
              currentStep >= stepNum ? 'bg-[#4086F7]' : 'bg-[#D3E1FD]'
            }`}
          />
        );

        if (onStepPress) {
          return (
            <TouchableOpacity
              key={stepNum}
              activeOpacity={0.7}
              onPress={() => onStepPress(stepNum)}
              className="flex-1 py-1"
            >
              {bar}
            </TouchableOpacity>
          );
        }

        return (
          <View key={stepNum} className="flex-1">
            {bar}
          </View>
        );
      })}
    </View>
  );
} 
