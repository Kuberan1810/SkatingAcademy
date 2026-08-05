import PrimaryBtn from '@/components/ui/PrimaryBtn';
import styles, { COLORS } from '@/styles/styles';
import { Image } from 'expo-image';
import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { AttendanceStatus, StudentData } from './StudentAttendanceCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height } = Dimensions.get('window');

const DEFAULT_AVATAR = require('@/../assets/images/user-avatar.png');

export interface AttendanceSummarySheetProps {
  visible: boolean;
  batchName?: string;
  dateText?: string;
  students: StudentData[];
  attendanceMap: Record<string, AttendanceStatus>;
  onClose: () => void;
  onEditAttendance?: () => void;
  onConfirmAttendance?: () => void;
  confirmLoading?: boolean;
}

function DrawerStatCard({
  title,
  value,
  backgroundColor,
  borderColor,
  titleColor = '#626262',
  valueColor = '#1E1E2D',
}: {
  title: string;
  value: string | number;
  backgroundColor: string;
  borderColor: string;
  titleColor?: string;
  valueColor?: string;
}) {
  return (
    <View
      style={{ backgroundColor, borderColor }}
      className="flex-1 border rounded-[28px] p-2.5 min-h-[90px] items-center justify-center"
    >
      <Text
        style={{ color: titleColor }}
        className="text-[12px] font-urbanist-bold tracking-wider uppercase text-center mb-2"
      >
        {title}
      </Text>
      <Text
        style={{ color: valueColor }}
        className="text-[28px] font-urbanist-bold text-center tracking-tight"
      >
        {value}
      </Text>
    </View>
  );
}

export default function AttendanceSummarySheet({
  visible,
  batchName = 'Sathya Stadium (6:00 AM - 7:30 AM)',
  dateText = 'Tuesday, 22 July 2026',
  students,
  attendanceMap,
  onClose,
  onEditAttendance,
  onConfirmAttendance,
  confirmLoading = false,
}: AttendanceSummarySheetProps) {
  const [showModal, setShowModal] = React.useState(visible);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const toggleExpand = (expand: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(expand);
  };

  // PanResponder gesture control matching BatchOptionsBottomSheet: Drag down anywhere on sheet to close
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 4 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          const opacity = Math.max(0, 1 - gestureState.dy / (height / 2));
          fadeAnim.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.3) {
          // Dragged DOWN: Close drawer
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
          // Reset position
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

  React.useEffect(() => {
    if (visible) {
      setIsExpanded(false);
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
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal) return null;

  const realAbsent = students.filter((s) => attendanceMap[s.id] === 'absent');
  const allAbsentList =
    realAbsent.length > 2
      ? realAbsent
      : [
          { id: '1', name: 'Rahul Sharma', record: '20/24 Of Clasess' },
          { id: '2', name: 'Sharma', record: '16/24 Of Clasess' },
          { id: '3', name: 'Ananya Verma', record: '18/24 Of Clasess' },
          { id: '4', name: 'Priya Singh', record: '14/24 Of Clasess' },
          { id: '5', name: 'Karthik R', record: '12/24 Of Clasess' },
          { id: '6', name: 'Siddharth M', record: '15/24 Of Clasess' },
          { id: '7', name: 'Vikas Kumar', record: '19/24 Of Clasess' },
          { id: '8', name: 'Meera Nair', record: '17/24 Of Clasess' },
          { id: '9', name: 'Rohan Gupta', record: '13/24 Of Clasess' },
          { id: '10', name: 'Divya Reddy', record: '21/24 Of Clasess' },
          { id: '11', name: 'Aarav Patel', record: '11/24 Of Clasess' },
          { id: '12', name: 'Kavya Shah', record: '15/24 Of Clasess' },
        ];

  const totalStudents = students.length || 90;
  const presentCount = totalStudents - allAbsentList.length;
  const absentCount = allAbsentList.length;

  const visibleAbsent = allAbsentList.slice(0, 2);
  const extraAbsentCount = allAbsentList.length - 2;

  return (
    <Modal
      visible={visible && showModal}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={sheetStyles.overlay} pointerEvents={visible ? 'auto' : 'none'}>
        {/* Backdrop */}
        <Animated.View style={[sheetStyles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={sheetStyles.backdropTouch}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Bottom Sheet Drawer */}
        <Animated.View
          style={[
            sheetStyles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Drag Handle area with PanResponder handlers */}
          <View style={sheetStyles.dragArea} {...panResponder.panHandlers}>
            <View style={sheetStyles.dragHandle} />
          </View>

          {/* Section Header */}
          <Text className="px-5 text-[13px] font-urbanist-semibold text-[#626262] tracking-wider uppercase mb-3">
            ATTENDANCE SUMMARY
          </Text>

          {/* Batch Title */}
          <Text className="px-5 text-[20px] font-urbanist-bold text-primary mb-1.5">
            {batchName}
          </Text>

          {/* Date */}
          <Text className="px-5 text-[17px] font-urbanist-medium text-secondary">
            {dateText}
          </Text>

          {/* Stats Row (3 Centered Cards) */}
          <View 
           className="flex-row gap-3 mt-5 mb-5 px-5">
            <DrawerStatCard
              title="TOTAL STUDENTS"
              value={totalStudents}
              backgroundColor="#DCF2FF"
              borderColor="#C6EAFF"
              titleColor="#5A6E85"
              valueColor="#1E1E2D"
            />
            <DrawerStatCard
              title="PRESENT"
              value={presentCount}
              backgroundColor="#EBF8EF"
              borderColor="#D4EBDB"
              titleColor="#5A6E85"
              valueColor="#167D44"
            />
            <DrawerStatCard
              title="ABSENT"
              value={absentCount}
              backgroundColor="#FDE8E8"
              borderColor="#F9D0D0"
              titleColor="#5A6E85"
              valueColor="#E54848"
            />
          </View>

          {/* Absent Students Section */}
          <View className="px-5 mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[13px] font-urbanist-semibold text-[#626262] tracking-wider uppercase">
                ABSENT STUDENTS ({allAbsentList.length})
              </Text>
              {isExpanded && (
                <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpand(false)}>
                  <Text className="text-[13px] font-urbanist-bold text-[#167D44]">
                    Show Less
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!isExpanded ? (
              /* Compact Single Row View */
              <View className="flex-row items-center gap-3">
                {visibleAbsent.map((s, idx) => (
                  <View
                    key={s.id || idx}
                    className="flex-row items-center gap-2.5 flex-1"
                  >
                    <View className="w-[48px] h-[48px] rounded-full overflow-hidden bg-[#DDEEFF] justify-center items-center">
                      <Image
                        source={DEFAULT_AVATAR}
                        style={{ width: 48, height: 48, borderRadius: 24 }}
                        contentFit="cover"
                      />
                    </View>
                    <View className="flex-1 justify-center">
                      <Text className="text-[16px] font-urbanist-bold text-primary" numberOfLines={1}>
                        {s.name}
                      </Text>
                      <Text className="text-[20px] font-urbanist-bold text-[#E54848]">
                        {idx === 0 ? '20' : '16'}
                        <Text className="text-[10px] font-urbanist-medium text-[#E54848]">
                          /24 Of Clasess
                        </Text>
                      </Text>
                    </View>
                  </View>
                ))}

                {/* +More Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.BlackInnerShadowStyle]}
                  onPress={() => toggleExpand(true)}
                  className="bg-[#FFFFFF] border border-primary-border rounded-[18px] p-4 justify-center items-center"
                >
                  <Text className="text-[12px] font-urbanist-bold text-primary tracking-tight">
                    +{extraAbsentCount} More
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Expanded Scrollable List of All Absent Students */
              <ScrollView
                style={{ height: 320 }}
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                <View className="flex-row flex-wrap gap-x-2 gap-y-3.5 pb-2">
                  {allAbsentList.map((s, idx) => (
                    <View
                      key={s.id || idx}
                      className="flex-row items-center gap-2.5 w-[48%]"
                    >
                      <View className="w-[48px] h-[48px] rounded-full overflow-hidden bg-[#DDEEFF] justify-center items-center">
                        <Image
                          source={DEFAULT_AVATAR}
                          style={{ width: 48, height: 48, borderRadius: 24 }}
                          contentFit="cover"
                        />
                      </View>
                      <View className="flex-1 justify-center">
                        <Text className="text-[16px] font-urbanist-bold text-primary" numberOfLines={1}>
                          {s.name}
                        </Text>
                        <Text className="text-[20px] font-urbanist-bold text-[#E54848]">
                          {14 + (idx % 7)}
                          <Text className="text-[10px] font-urbanist-medium text-[#E54848]">
                            /24 Of Clasess
                          </Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Action Buttons Row */}
          <View className="flex-row gap-3 px-5 pt-2">
            {/* Edit Attendance */}
            <PrimaryBtn
              label="Edit Attendance"
              variant="outline"
              className="flex-1"
              onPress={() => {
                onClose();
                onEditAttendance?.();
              }}
            />

            {/* Confirm Attendance */}
            <PrimaryBtn
              label="Confirm Attendance"
              variant="green"
              className="flex-[1.3]"
              loading={confirmLoading}
              onPress={() => {
                onConfirmAttendance?.();
              }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  dragArea: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 60,
    height: 5,
    borderRadius: 19,
    backgroundColor: '#E5E5E5',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    color: COLORS.primary,
  },
  confirmButton: {
    flex: 1.3,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#167D44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    color: '#FFFFFF',
  },
});
