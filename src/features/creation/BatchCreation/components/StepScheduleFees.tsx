import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Calendar, Clock } from 'iconsax-react-native';
import FormField from './FormField';
import { BatchFormData } from '../types';

export interface StepScheduleFeesProps {
  formData: BatchFormData;
  updateField: (key: keyof BatchFormData, val: string) => void;
  onOpenPicker: (type: 'classType' | 'trainingDays' | 'startTime' | 'endTime') => void;
  onFocusBottomField?: () => void;
}

export default function StepScheduleFees({
  formData,
  updateField,
  onOpenPicker,
  onFocusBottomField,
}: StepScheduleFeesProps) {
  return (
    <View className="gap-5">
      {/* Class Type Dropdown */}
      <FormField
        label="Class Type"
        placeholder="Select Class Type"
        value={formData.classType}
        onChangeText={() => {}}
        isDropdown={true}
        onPressDropdown={() => onOpenPicker('classType')}
      />

      {/* Training Days */}
      <FormField
        label="Training Days"
        placeholder="Select Days (e.g. Mon, Wed, Fri)"
        value={formData.trainingDays}
        onChangeText={(text) => updateField('trainingDays', text)}
        icon={Calendar}
        onPress={() => onOpenPicker('trainingDays')}
      />

      {/* Start Time & End Time Row */}
      <View className="flex-row gap-3.5">
        {/* Start Time */}
        <View className="flex-1 gap-2">
          <Text className="text-[14px] font-urbanist-semibold text-primary">
            Start Time
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onOpenPicker('startTime')}
            className="h-[50px] bg-white rounded-full border border-primary-border flex-row items-center px-4 justify-between"
          >
            <Text
              className={`text-[14px] font-urbanist-medium ${
                formData.startTime ? 'text-[#111827]' : 'text-[#A2A2A7]'
              }`}
            >
              {formData.startTime || 'Start Time'}
            </Text>
            <Clock size={18} color="#A2A2A7" variant="Linear" />
          </TouchableOpacity>
        </View>

        {/* End Time */}
        <View className="flex-1 gap-2">
          <Text className="text-[14px] font-urbanist-semibold text-primary">
            End Time
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onOpenPicker('endTime')}
            className="h-[50px] bg-white rounded-full border border-primary-border flex-row items-center px-4 justify-between"
          >
            <Text
              className={`text-[14px] font-urbanist-medium ${
                formData.endTime ? 'text-[#111827]' : 'text-[#A2A2A7]'
              }`}
            >
              {formData.endTime || 'End Time'}
            </Text>
            <Clock size={18} color="#A2A2A7" variant="Linear" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Monthly Fee */}
      <View className="gap-2">
        <Text className="text-[14px] font-urbanist-semibold text-primary">
          Monthly Fee
        </Text>
        <View className="h-[50px] bg-white rounded-full border border-primary-border flex-row items-center px-4 gap-1.5">
          <Text className="text-[15px] font-urbanist-medium text-[#333]">
            ₹
          </Text>
          <TextInput
            className="flex-1 text-[15px] font-urbanist-medium text-[#333] p-0"
            placeholder="1,250"
            placeholderTextColor="#A2A2A7"
            value={formData.monthlyFee}
            onChangeText={(text) => updateField('monthlyFee', text)}
            keyboardType="numeric"
            onFocus={onFocusBottomField}
          />
        </View>
      </View>
    </View>
  );
}
