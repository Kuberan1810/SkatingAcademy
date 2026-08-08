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
}: FormFieldProps) {
  if (isDropdown) {
    return (
      <View className="gap-1.5">
        <Text className="text-[14px] font-urbanist-semibold text-[#374151]">
          {label}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressDropdown}
          className="h-[50px] bg-white rounded-[16px] border border-[#F3F4F6] flex-row items-center px-4 justify-between"
        >
          <Text
            className={`text-[15px] font-urbanist-medium ${
              value ? 'text-[#111827]' : 'text-[#9CA3AF]'
            }`}
          >
            {value || placeholder}
          </Text>
          <ArrowDown2 size={18} color="#6B7280" variant="Linear" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="gap-1.5">
      <Text className="text-[14px] font-urbanist-semibold text-[#374151]">
        {label}
      </Text>
      <View className="h-[50px] bg-white rounded-[16px] border border-[#F3F4F6] flex-row items-center px-4 justify-between">
        <TextInput
          className="flex-1 text-[15px] font-urbanist-medium text-[#111827] p-0"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
        {IconComponent && (
          <IconComponent size={20} color="#9CA3AF" variant="Linear" />
        )}
      </View>
    </View>
  );
}
