import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

export interface CheckboxProps {
  label?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  className = '',
  disabled = false,
}) => {
  const handlePress = () => {
    if (disabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onChange(!checked);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
      className={`flex-row items-center gap-2.5 ${className}`}
    >
      <View
        className={`w-4 h-4 rounded-[4px] border items-center justify-center ${
          checked ? 'bg-black border-black' : 'bg-white border-[#C4C7C7]'
        }`}
      >
        {checked ? (
          <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 13l4 4L19 7"
              stroke="#FFFFFF"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : null}
      </View>

      {label ? (
        typeof label === 'string' ? (
          <Text className="text-[#626262] text-sm font-urbanist-medium">
            {label}
          </Text>
        ) : (
          label
        )
      ) : null}
    </TouchableOpacity>
  );
};

export default Checkbox;
