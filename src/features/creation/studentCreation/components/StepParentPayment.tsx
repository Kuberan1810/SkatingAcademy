import React from 'react';
import { View } from 'react-native';
import FormField from './FormField';
import { StudentFormData } from '../types';

export interface StepParentPaymentProps {
  formData: StudentFormData;
  updateField: (key: keyof StudentFormData, val: string) => void;
  onFocusBottomField?: () => void;
}

export default function StepParentPayment({
  formData,
  updateField,
  onFocusBottomField,
}: StepParentPaymentProps) {
  const handleFeeChange = (val: string) => {
    const numeric = val.replace(/[^0-9]/g, '');
    if (!numeric) {
      updateField('monthlyFee', '');
      return;
    }
    const formatted = `₹${parseInt(numeric, 10).toLocaleString('en-IN')}`;
    updateField('monthlyFee', formatted);
  };

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
        placeholder="+91 9876543210"
        value={formData.phoneNumber}
        onChangeText={(text) => updateField('phoneNumber', text)}
        keyboardType="phone-pad"
      />

      <FormField
        label="Emergency Contact"
        placeholder="+91 9876543210"
        value={formData.emergencyContact}
        onChangeText={(text) => updateField('emergencyContact', text)}
        keyboardType="phone-pad"
        onFocus={onFocusBottomField}
      />

      <FormField
        label="Monthly Fee"
        placeholder="₹0 (Optional)"
        value={formData.monthlyFee || ''}
        onChangeText={handleFeeChange}
        keyboardType="numeric"
        onFocus={onFocusBottomField}
      />
    </View>
  );
}
