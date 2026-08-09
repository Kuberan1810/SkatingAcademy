import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Location, Clock } from 'iconsax-react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import PrimaryBtn from '@/components/ui/PrimaryBtn';
import styles from '@/styles/styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SuccessStudentModalProps {
  visible: boolean;
  studentName: string;
  batchName: string;
  batchTime?: string;
  onAddAnother: () => void;
  onViewBatch: () => void;
  onClose: () => void;
}

export default function SuccessStudentModal({
  visible,
  studentName,
  batchName,
  batchTime = '06:00 – 07:30 AM',
  onAddAnother,
  onViewBatch,
  onClose,
}: SuccessStudentModalProps) {
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
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
          const opacity = Math.max(0, 1 - gestureState.dy / (SCREEN_HEIGHT / 2));
          fadeAnim.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.3) {
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: SCREEN_HEIGHT,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowModal(false);
            onClose();
          });
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 65,
              friction: 11,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (showModal) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  if (!showModal && !visible) {
    return null;
  }

  const handleClose = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  // Exact Notch / Shoulder Curve SVG formula with generous clearance matching screenshot
  const W = SCREEN_WIDTH;
  const cx = W / 2;
  const topSvgHeight = 76;
  const yShoulder = 34;
  const rCorner = 30;
  const dipHalfWidth = 72;
  const dipDepth = 30; // Scoop bottom at y = 64

  const topCurvePath = `
    M 0 ${topSvgHeight}
    L 0 ${yShoulder + rCorner}
    Q 0 ${yShoulder} ${rCorner} ${yShoulder}
    L ${cx - dipHalfWidth} ${yShoulder}
    C ${cx - 38} ${yShoulder}, ${cx - 34} ${yShoulder + dipDepth}, ${cx} ${yShoulder + dipDepth}
    C ${cx + 34} ${yShoulder + dipDepth}, ${cx + 38} ${yShoulder}, ${cx + dipHalfWidth} ${yShoulder}
    L ${W - rCorner} ${yShoulder}
    Q ${W} ${yShoulder} ${W} ${yShoulder + rCorner}
    L ${W} ${topSvgHeight}
    Z
  `;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" className="z-50 justify-end">
      {/* Dimmed Overlay Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.52)',
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Animated Bottom Sheet Container */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateY: slideAnim }],
        }}
        className="w-full relative"
      >
        {/* Top Wave Mask with Shoulder Curve and Concave Dip */}
        <View className="w-full relative" style={{ height: topSvgHeight }}>
          <Svg width={W} height={topSvgHeight} viewBox={`0 0 ${W} ${topSvgHeight}`}>
            <Path d={topCurvePath} fill="#FFFFFF" />
          </Svg>

          {/* Centered Floating Close (X) Button with Perfect Clearance Gap */}
          <View
            style={{
              position: 'absolute',
              top: 4,
              left: cx - 22,
              width: 44,
              height: 44,
              zIndex: 20,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleClose}
              className="w-[44px] h-[44px] rounded-full bg-white items-center justify-center border border-primary-border"
              style={{
                elevation: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
              }}
            >
              <X size={19} color="#111827" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main White Content Card */}
        <View
          className="bg-white px-6 pb-9 pt-0 items-center w-full"
          style={{ marginTop: -2 }}
        >
          {/* Success Checkmark Badge */}
          <View className="w-[84px] h-[84px] rounded-full bg-[#DCFCE7] items-center justify-center mt-12 mb-4">
            <View className="w-[46px] h-[46px] rounded-full bg-[#12B76A] items-center justify-center">
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 12.5L9.5 17L19 7.5"
                  stroke="#FFFFFF"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>

          {/* Title */}
          <Text className="text-[22px] font-urbanist-semibold text-primary text-center mb-1 tracking-tight">
            Student Added Successfully
          </Text>

          {/* Batch Name */}
          <Text className="text-[19px] font-urbanist-semibold text-[#4186F7] text-center mb-8">
            {batchName || 'Morning Beginners'}
          </Text>

          {/* Student & Time Summary Card */}
          <View className="bg-[#DCF2FF] border border-[#C6EAFF] rounded-[22px] py-5 px-5 w-full flex-row items-center justify-between mb-12">
            {/* Name Column */}
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <Location size={22} color="#1570EF" />
              <View className="flex-1">
                <Text className="text-[12px] font-urbanist-medium text-secondary">Name</Text>
                <Text
                  className="text-[16px] font-urbanist-semibold text-primary"
                  numberOfLines={1}
                >
                  {studentName || 'Student Name'}
                </Text>
              </View>
            </View>

            {/* Time Column */}
            <View className="flex-row items-center gap-3">
              <Clock size={22} color="#1570EF" />
              <View>
                <Text className="text-[12px] font-urbanist-medium text-secondary">Time</Text>
                <Text className="text-[16px] font-urbanist-semibold text-primary">
                  {batchTime || '06:00 – 07:30 AM'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View className="flex-row items-center gap-3.5 w-full">
            {/* Add Student Button */}
            <PrimaryBtn
              label="Add Student"
              variant="outline"
              className="flex-1 h-[48px]"
              onPress={onAddAnother}
            />

            {/* View Batch Button */}
            <PrimaryBtn
              label="View Batch"
              bgColor="#4186F7"
              textColor="#fff"
              className="flex-1 h-[48px]"
              onPress={onViewBatch}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
