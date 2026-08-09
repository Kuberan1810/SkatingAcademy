import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ArrowDown2 } from 'iconsax-react-native';

export interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  icon?: React.ComponentType<any>;
  isDropdown?: boolean;
  onPressDropdown?: () => void;
  onPress?: () => void;
  onFocus?: () => void;
}

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  icon: IconComponent,
  isDropdown = false,
  onPressDropdown,
  onPress,
  onFocus,
}: FormFieldProps) {
  if (isDropdown || onPress) {
    const handlePress = onPressDropdown || onPress;
    return (
      <View className="gap-2">
        <Text className="text-[14px] font-urbanist-semibold text-primary">
          {label}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePress}
          className="h-[50px] bg-white rounded-full border border-primary-border flex-row items-center px-5 justify-between"
        >
          <Text
            className={`text-[15px] font-urbanist-medium ${
              value ? 'text-[#111827]' : 'text-[#A2A2A7]'
            }`}
          >
            {value || placeholder}
          </Text>
          {isDropdown ? (
            <ArrowDown2 size={18} color="#6B7280" variant="Linear" />
          ) : IconComponent ? (
            <IconComponent size={20} color="#A2A2A7" variant="Linear" />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Text className="text-[14px] font-urbanist-semibold text-primary">
        {label}
      </Text>
      <View className="h-[50px] bg-white rounded-full border border-primary-border flex-row items-center px-5 justify-between">
        <TextInput
          className="flex-1 text-[15px] font-urbanist-medium text-[#111827] p-0"
          placeholder={placeholder}
          placeholderTextColor="#A2A2A7"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          onFocus={onFocus}
        />
        {IconComponent && (
          <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            <IconComponent size={20} color="#A2A2A7" variant="Linear" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
