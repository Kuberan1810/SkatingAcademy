import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Camera, Add } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import styles from '@/styles/styles';

export interface AvatarPickerProps {
  avatarUri?: string | null;
  onPress?: () => void;
}

export default function AvatarPicker({
  avatarUri,
  onPress,
}: AvatarPickerProps) {
  const handleAvatarPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleAvatarPress}
      className="self-center mt-2 mb-8 relative"
    >
      {avatarUri ? (
        <View className="relative p-1 bg-white rounded-full border border-gray-100 shadow-sm">
          <Image
            source={{ uri: avatarUri }}
            className="w-[120px] h-[120px] rounded-full"
          />
          <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#4086F7] items-center justify-center border-2 border-white shadow-md">
            <Camera size={18} color="#FFFFFF" variant="Bold" />
          </View>
        </View>
      ) : (
        <View className="relative p-1 bg-white rounded-full border border-gray-100 shadow-sm">
          <View
            style={[styles.InnerShadowStyle]}
            className="w-[120px] h-[120px] rounded-full bg-[#F3F4F6] items-center justify-center"
          >
            <Camera size={34} color="#9CA3AF" variant="Linear" />
          </View>
          <View className="absolute bottom-1 right-3 w-9 h-9 rounded-full bg-[#4086F7] items-center justify-center border-2 border-white shadow-md">
            <Add size={20} color="#FFFFFF" variant="Bold" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
