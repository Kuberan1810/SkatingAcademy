import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { TickCircle, CloseCircle } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';

export interface OptionPickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (option: string) => void;
  onClose: () => void;
}

export default function OptionPickerModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-white rounded-t-[28px] px-5 pt-3 pb-8">
          <View className="w-9 h-1 rounded-full bg-gray-300 self-center mb-3" />
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[18px] font-urbanist-bold text-[#111827]">
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <CloseCircle size={22} color="#6B7280" variant="Linear" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-[300px]">
            {options.map((opt) => {
              const isSelected = selectedValue === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch (e) {}
                    onSelect(opt);
                    onClose();
                  }}
                  className={`flex-row items-center justify-between py-3.5 px-3 rounded-xl ${
                    isSelected ? 'bg-[#EFF6FF]' : 'active:bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-[15px] ${
                      isSelected
                        ? 'font-urbanist-bold text-[#4E75F8]'
                        : 'font-urbanist-semibold text-[#374151]'
                    }`}
                  >
                    {opt}
                  </Text>
                  {isSelected && (
                    <TickCircle size={20} color="#4E75F8" variant="Bold" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
