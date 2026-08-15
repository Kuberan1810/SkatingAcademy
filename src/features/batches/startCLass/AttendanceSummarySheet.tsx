import PrimaryBtn from '@/components/ui/PrimaryBtn';
import StudentAvatar from '@/components/ui/StudentAvatar';
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
import styles from '@/styles/styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (e) {
    // Ignore in New Architecture
  }
}

const { height } = Dimensions.get('window');

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
  batchName = 'Class Session',
  dateText = 'Today',
  students = [],
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

  // Derive real absent list based strictly on attendanceMap
  const absentStudents = students.filter(
    (s) => attendanceMap[s.id] === 'absent'
  );

  const totalStudents = students.length;
  const absentCount = absentStudents.length;
  const presentCount = totalStudents - absentCount;

  const visibleAbsent = absentStudents.slice(0, 2);
  const extraAbsentCount = absentStudents.length - 2;

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
          {/* Drag Handle area */}
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
          <View className="flex-row gap-3 mt-5 mb-5 px-5">
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
                ABSENT STUDENTS ({absentCount})
              </Text>
              {isExpanded && (
                <TouchableOpacity
                  activeOpacity={0.7}

                  onPress={() => toggleExpand(false)}>
                  <Text className="text-[13px] font-urbanist-bold text-[#167D44]">
                    Show Less
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {absentCount === 0 ? (
              <View className="py-4 px-4 bg-[#F9F9F9] rounded-[20px] border border-primary-border items-center justify-center">
                <Text className="text-[14px] font-urbanist-medium text-secondary">
                  All students are present today!
                </Text>
              </View>
            ) : !isExpanded ? (
              /* Compact View */
              <View className="flex-row items-center gap-3">
                {visibleAbsent.map((s) => (
                  <View
                    key={s.id}
                    className="flex-row items-center gap-2.5 flex-1"
                  >
                    <StudentAvatar name={s.name} avatarUri={s.avatar} size={40} />
                    <View className="flex-1 justify-center">
                      <Text className="text-[15px] font-urbanist-bold text-primary" numberOfLines={1}>
                        {s.name}
                      </Text>
                      <Text className="text-[18px] font-urbanist-bold text-red-500">
                        {s.attendedClasses ?? 0}
                        <Text className="text-[11px] font-urbanist-semibold text-red-500">
                          /{s.conductedClasses ?? 0} Of Classes
                        </Text>
                      </Text>
                    </View>
                  </View>
                ))}

                {extraAbsentCount > 0 && (
                  <TouchableOpacity
                    style={[styles.BlackInnerShadowStyle]}
                    activeOpacity={0.8}
                    onPress={() => toggleExpand(true)}
                    className="bg-[#FFFFFF] border border-primary-border rounded-[18px] px-4 py-2.5 justify-center items-center"
                  >
                    <Text className="text-[12px] font-urbanist-semibold text-primary tracking-tight">
                      +{extraAbsentCount} More
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              /* Expanded Scrollable List */
              <ScrollView
                style={{ maxHeight: 240 }}
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                <View className="flex-row flex-wrap gap-x-2 gap-y-3.5 pb-2">
                  {absentStudents.map((s) => (
                    <View
                      key={s.id}
                      className="flex-row items-center gap-2.5 w-[48%]"
                    >
                      <StudentAvatar name={s.name} avatarUri={s.avatar} size={40} />
                      <View className="flex-1 justify-center">
                        <Text className="text-[14px] font-urbanist-bold text-primary" numberOfLines={1}>
                          {s.name}
                        </Text>
                        <Text className="text-[17px] font-urbanist-bold text-red-500">
                          {s.attendedClasses ?? 0}
                          <Text className="text-[10px] font-urbanist-semibold text-red-500">
                            /{s.conductedClasses ?? 0} Of Classes
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
              disabled={confirmLoading}
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
});
