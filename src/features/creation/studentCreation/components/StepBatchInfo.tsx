import React from 'react';
import { View } from 'react-native';
import { Calendar } from 'iconsax-react-native';
import FormField from './FormField';
import { StudentFormData } from '../types';

export interface StepBatchInfoProps {
  formData: StudentFormData;
  updateField: (key: keyof StudentFormData, val: string) => void;
  onOpenBatchPicker: () => void;
}

export default function StepBatchInfo({
  formData,
  updateField,
  onOpenBatchPicker,
}: StepBatchInfoProps) {
  return (
    <View className="gap-4 mb-6">
      <FormField
        label="Batch"
        placeholder="Enter the name"
        value={formData.batch}
        onChangeText={(text) => updateField('batch', text)}
        isDropdown
        onPressDropdown={onOpenBatchPicker}
      />

      <FormField
        label="Join Date"
        placeholder="DD / MM / YYYY"
        value={formData.joinDate}
        onChangeText={(text) => updateField('joinDate', text)}
        icon={Calendar}
      />
    </View>
  );
}
