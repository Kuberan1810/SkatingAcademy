import React from 'react';
import { View, Text } from 'react-native';
import styles from '@/styles/styles';

export interface InfoRowItem {
  label: string;
  value: string;
  valueColor?: string;
  isBoldValue?: boolean;
}

export interface InfoCardProps {
  title: string;
  items: InfoRowItem[];
  className?: string;
}

export default function InfoCard({ title, items, className = '' }: InfoCardProps) {
  return (
    <View
     
      className={`bg-white rounded-[28px] p-6 border border-primary-border mb-5 ${className}`}
    >
      {/* Card Header Title */}
      <Text className="text-[20px] font-urbanist-bold text-primary mb-4">
        {title}
      </Text>

      {/* Rows Container */}
      <View className="gap-3.5">
        {items.map((item, index) => (
          <View key={index} className="flex-row items-center justify-between">
            <Text className="text-[14px] font-urbanist-medium text-[#808080]">
              {item.label}
            </Text>
            <Text
              className={`text-[14px] ${
                item.isBoldValue !== false ? 'font-urbanist-semibold' : 'font-urbanist-medium'
              }`}
              style={{ color: item.valueColor || '#333333' }}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
