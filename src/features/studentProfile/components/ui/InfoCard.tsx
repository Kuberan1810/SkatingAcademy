import React from 'react';
import { View, Text } from 'react-native';
import styles from '@/styles/styles';

export interface InfoRowItem {
  label: string;
  value?: string | number | null;
  valueColor?: string;
  isBoldValue?: boolean;
  placeholder?: string;
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
        {items.map((item, index) => {
          const rawValue = item.value;
          const isMissing =
            rawValue === undefined ||
            rawValue === null ||
            rawValue === '' ||
            String(rawValue).trim() === '' ||
            String(rawValue).trim().toLowerCase() === 'undefined' ||
            String(rawValue).trim().toLowerCase() === 'null' ||
            String(rawValue).trim().toLowerCase() === 'n/a';

          const displayText = isMissing
            ? item.placeholder || 'Not Provided'
            : String(rawValue);
          const textColor = isMissing ? '#9CA3AF' : item.valueColor || '#333333';

          return (
            <View key={index} className="flex-row items-center justify-between">
              <Text className="text-[14px] font-urbanist-medium text-[#808080]">
                {item.label}
              </Text>
              <Text
                className={`${
                  isMissing
                    ? 'text-[12px] font-urbanist-medium italic opacity-50'
                    : item.isBoldValue !== false
                    ? 'text-[14px] font-urbanist-semibold'
                    : 'text-[14px] font-urbanist-medium'
                }`}
                style={{ color: textColor }}
              >
                {displayText}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
