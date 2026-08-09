import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Camera, Gallery, Trash } from 'iconsax-react-native';
import { X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

export interface PhotoPickerModalProps {
  visible: boolean;
  avatarUri?: string | null;
  onImageSelected?: (uri: string | null) => void;
  onClose: () => void;
}

export default function PhotoPickerModal({
  visible,
  avatarUri,
  onImageSelected,
  onClose,
}: PhotoPickerModalProps) {
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return gestureState.dy > 15 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          const opacity = Math.max(0, 1 - gestureState.dy / (height / 2));
          fadeAnim.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.3) {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: height,
              useNativeDriver: true,
              velocity: gestureState.vy,
              damping: 20,
              mass: 0.6,
              stiffness: 100,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onClose();
          });
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 6,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
      setShowModal(true);
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          mass: 0.8,
          stiffness: 110,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  const pickFromGallery = async () => {
    onClose();
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
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        onImageSelected?.(selectedUri);
      }
    } catch (error) {
      console.log('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const takePhotoWithCamera = async () => {
    onClose();
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
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        onImageSelected?.(photoUri);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'Failed to open camera.');
    }
  };

  const handleRemovePhoto = () => {
    onClose();
    onImageSelected?.(null);
  };

  if (!showModal) return null;

  return (
    <View style={sheetStyles.overlayWrapper}>
      {/* Soft Backdrop */}
      <Animated.View style={[sheetStyles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={sheetStyles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Clean White Bottom Sheet with Gesture Pan */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          sheetStyles.modalContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Top Pill Handle */}
        <View style={sheetStyles.dragArea}>
          <View style={sheetStyles.dragHandle} />
        </View>

        {/* Sheet Title Bar */}
        <View className="flex-row items-center justify-between px-5 mb-3">
          <Text className="text-[18px] font-urbanist-bold text-primary">
            Upload Student Photo
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-1.5 rounded-full active:bg-gray-100"
          >
            <X size={20} color="#626262" />
          </TouchableOpacity>
        </View>

        {/* Options List */}
        <View className="px-4 py-1 gap-2 pb-2">
          <Pressable
            className="flex-row items-center gap-3.5 py-3.5 px-4 rounded-xl  active:bg-gray-50"
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (e) {}
              takePhotoWithCamera();
            }}
            android_ripple={{ color: '#E5E7EB' }}
          >
            <Camera size={22} color="#4E75F8" variant="Linear" />
            <Text className="text-[15px] font-urbanist-semibold text-primary">
              Take Photo with Camera
            </Text>
          </Pressable>

          <Pressable
            className="flex-row items-center gap-3.5 py-3.5 px-4 rounded-xl  active:bg-gray-50"
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (e) {}
              pickFromGallery();
            }}
            android_ripple={{ color: '#E5E7EB' }}
          >
            <Gallery size={22} color="#4E75F8" variant="Linear" />
            <Text className="text-[15px] font-urbanist-semibold text-primary">
              Choose from Gallery
            </Text>
          </Pressable>

          {avatarUri ? (
            <Pressable
              className="flex-row items-center gap-3.5 py-3.5 px-4 rounded-xl  active:bg-red-50"
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch (e) {}
                handleRemovePhoto();
              }}
              android_ripple={{ color: '#FEE2E2' }}
            >
              <Trash size={22} color="#EF4444" variant="Linear" />
              <Text className="text-[15px] font-urbanist-semibold text-red-500">
                Remove Photo
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    elevation: 99999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 20,
  },
  dragArea: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
});
