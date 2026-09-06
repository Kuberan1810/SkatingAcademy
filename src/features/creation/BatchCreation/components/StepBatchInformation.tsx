import React from 'react';
import { View } from 'react-native';
import FormField from './FormField';
import { BatchFormData } from '../types';

export interface StepBatchInformationProps {
  formData: BatchFormData;
  updateField: (key: keyof BatchFormData, val: string) => void;
  onOpenPicker?: (type: 'level') => void;
  onFocusBottomField?: () => void;
}

export default function StepBatchInformation({
  formData,
  updateField,
  onFocusBottomField,
}: StepBatchInformationProps) {
  return (
    <View className="gap-5">
      {/* Batch Name */}
      <FormField
        label="Batch Name"
        placeholder="Enter the Batch Name"
        value={formData.batchName}
        onChangeText={(text) => updateField('batchName', text)}
      />

      {/* Location */}
      <FormField
        label="Location"
        placeholder="Sathya Stadium"
        value={formData.location}
        onChangeText={(text) => updateField('location', text)}
      />

      {/* Description */}
      <FormField
        label="Description"
        placeholder="Enter description"
        value={formData.description}
        onChangeText={(text) => updateField('description', text)}
        onFocus={onFocusBottomField}
      />
    </View>
  );
}
