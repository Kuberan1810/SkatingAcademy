import React from 'react';
import { View } from 'react-native';
import { CalendarEdit } from 'iconsax-react-native';
import FormField from './FormField';
import { StudentFormData } from '../types';

export interface StepBasicInfoProps {
  formData: StudentFormData;
  updateField: (key: keyof StudentFormData, val: string) => void;
  onOpenGenderPicker: () => void;
  onOpenBloodGroupPicker: () => void;
  onOpenDatePicker?: () => void;
}

export default function StepBasicInfo({
  formData,
  updateField,
  onOpenGenderPicker,
  onOpenBloodGroupPicker,
  onOpenDatePicker,
}: StepBasicInfoProps) {
  return (
    <View className="gap-4 mb-6">
      {/* 1. Full Name */}
      <FormField
        label="Full Name"
        placeholder="Enter the name"
        value={formData.fullName}
        onChangeText={(text) => updateField('fullName', text)}
      />

      {/* 2. Gender */}
      <FormField
        label="Gender"
        placeholder="Select Gender"
        value={formData.gender}
        onChangeText={() => {}}
        isDropdown
        onPressDropdown={onOpenGenderPicker}
      />

      {/* 3. Date of Birth */}
      <FormField
        label="Date of Birth"
        placeholder="DD / MM / YYYY"
        value={formData.dob}
        onChangeText={(text) => updateField('dob', text)}
        icon={CalendarEdit}
        onPress={onOpenDatePicker}
      />

      {/* 4. Blood Group */}
      <FormField
        label="Blood Group"
        placeholder="Select Blood Group"
        value={formData.bloodGroup}
        onChangeText={() => {}}
        isDropdown
        onPressDropdown={onOpenBloodGroupPicker}
      />
    </View>
  );
}
