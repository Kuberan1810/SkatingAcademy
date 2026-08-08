import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Modal, Text, Pressable, Alert } from 'react-native';
import { Camera, Gallery, Trash, Add } from 'iconsax-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import styles from '@/styles/styles';
import { X } from 'lucide-react-native';

export interface AvatarPickerProps {
  avatarUri?: string | null;
  onPress?: () => void;
  onImageSelected?: (uri: string | null) => void;
}

export default function AvatarPicker({
  avatarUri,
  onPress,
  onImageSelected,
}: AvatarPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleAvatarPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (onPress) {
      onPress();
    } else {
      setModalVisible(true);
    }
  };

  const pickFromGallery = async () => {
    setModalVisible(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Permission to access photo gallery is required!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected?.(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image from gallery:', error);
    }
  };

  const takePhotoWithCamera = async () => {
    setModalVisible(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Permission to access camera is required!'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected?.(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
    }
  };

  const handleRemovePhoto = () => {
    setModalVisible(false);
    onImageSelected?.(null);
  };

  return (
    <>
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
            <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#4086F7] items-center justify-center border-2 border-white shadow-md">
              <Add size={20} color="#FFFFFF" variant="Bold" />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* PHOTO SELECTION MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View className="bg-white rounded-t-[28px] px-5 pt-3 pb-8">
            <View className="w-9 h-1 rounded-full bg-gray-300 self-center mb-3" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-urbanist-bold text-primary">
                Upload Student Photo
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color="#333333" />
              </TouchableOpacity>
            </View>

            <View className="gap-2">
              <Pressable
                onPress={takePhotoWithCamera}
                className="flex-row items-center gap-3.5 py-3.5 px-4 rounded-xl active:bg-gray-100"
              >
                <Camera size={22} color="#626262" variant="Linear" />
                <Text className="text-[16px] font-urbanist-semibold text-secondary">
                  Take Photo with Camera
                </Text>
              </Pressable>

              <Pressable
                onPress={pickFromGallery}
                className="flex-row items-center gap-3.5 py-3.5 px-4 rounded-xl active:bg-gray-100"
              >
                <Gallery size={22} color="#626262" variant="Linear" />
                <Text className="text-[16px] font-urbanist-semibold text-secondary">
                  Choose from Gallery
                </Text>
              </Pressable>

              {avatarUri ? (
                <Pressable
                  onPress={handleRemovePhoto}
                  className="flex-row items-center gap-3.5 py-3.5 px-4 rounded-xl active:bg-red-50"
                >
                  <Trash size={22} color="#EF4444" variant="Linear" />
                  <Text className="text-[16px] font-urbanist-semibold text-[#EF4444]">
                    Remove Photo
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
