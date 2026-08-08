import React from 'react';
import { View } from 'react-native';
import FormField from './FormField';
import { StudentFormData } from '../types';

export interface StepParentPaymentProps {
  formData: StudentFormData;
  updateField: (key: keyof StudentFormData, val: string) => void;
}

export default function StepParentPayment({
  formData,
  updateField,
}: StepParentPaymentProps) {
  return (
    <View className="gap-4 mb-6">
      <FormField
        label="Parent Name"
        placeholder="Enter the Parent Name"
        value={formData.parentName}
        onChangeText={(text) => updateField('parentName', text)}
      />

      <FormField
        label="Phone Number"
        placeholder="+91 "
        value={formData.phoneNumber}
        onChangeText={(text) => updateField('phoneNumber', text)}
        keyboardType="phone-pad"
      />

      <FormField
        label="Emergency Contact"
        placeholder="+91 "
        value={formData.emergencyContact}
        onChangeText={(text) => updateField('emergencyContact', text)}
        keyboardType="phone-pad"
      />

      <FormField
        label="Monthly Fee"
        placeholder="₹1,250"
        value={formData.monthlyFee}
        onChangeText={(text) => updateField('monthlyFee', text)}
      />
    </View>
  );
}
