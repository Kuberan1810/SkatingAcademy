import React from 'react';
import { View } from 'react-native';
import { Calendar } from 'iconsax-react-native';
import FormField from './FormField';
import { StudentFormData } from '../types';

export interface StepBasicInfoProps {
  formData: StudentFormData;
  updateField: (key: keyof StudentFormData, val: string) => void;
  onOpenGenderPicker: () => void;
  onOpenBloodGroupPicker: () => void;
}

export default function StepBasicInfo({
  formData,
  updateField,
  onOpenGenderPicker,
  onOpenBloodGroupPicker,
}: StepBasicInfoProps) {
  return (
    <View className="gap-4 mb-6">
      <FormField
        label="Full Name"
        placeholder="Enter the name"
        value={formData.fullName}
        onChangeText={(text) => updateField('fullName', text)}
      />

      <FormField
        label="Age"
        placeholder="Enter the Age"
        value={formData.age}
        onChangeText={(text) => updateField('age', text)}
        keyboardType="numeric"
      />

      <FormField
        label="Gender"
        placeholder="Select Gender"
        value={formData.gender}
        onChangeText={() => {}}
        isDropdown
        onPressDropdown={onOpenGenderPicker}
      />

      <FormField
        label="Date of Birth"
        placeholder="DD / MM / YYYY"
        value={formData.dob}
        onChangeText={(text) => updateField('dob', text)}
        icon={Calendar}
      />

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
