import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Layer, UserAdd, ImportSquare } from 'iconsax-react-native';
import { ChevronRight, X } from 'lucide-react-native';
import BulkImportModal from '@/features/creation/studentCreation/components/BulkImportModal';

interface QuickActionsModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

const ACTION_ITEMS = [
  {
    id: 'create_batch',
    title: 'Create Batch',
    description: 'Schedule and setup a new training batch.',
    icon: Layer,
    color: '#F97316', // Orange
    bgColor: '#FFF7ED',
  },
  {
    id: 'add_student',
    title: 'Add Student',
    description: 'Register a new student with full details.',
    icon: UserAdd,
    color: '#3B82F6', // Blue
    bgColor: '#EFF6FF',
  },
  {
    id: 'import_student',
    title: 'Import Student',
    description: 'Bulk import students via CSV, Excel, or Text.',
    icon: ImportSquare,
    color: '#10B981', // Emerald Green
    bgColor: '#ECFDF5',
  },
];

export default function QuickActionsModal({ visible, onClose }: QuickActionsModalProps) {
  const [showModal, setShowModal] = useState(visible);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderTerminationRequest: () => false,
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
      onPanResponderTerminate: () => {
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
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal && !isBulkImportOpen) return null;

  return (
    <>
      <Modal
        visible={showModal}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={modalStyles.overlayWrapper}>
          <Animated.View style={[modalStyles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={modalStyles.backdropTouch}
              activeOpacity={1}
              onPress={onClose}
            />
          </Animated.View>

          <Animated.View
            {...panResponder.panHandlers}
            style={[
              modalStyles.modalContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={modalStyles.dragArea}>
              <View style={modalStyles.dragHandle} />
            </View>

            <View style={modalStyles.header}>
              <View>
                <Text
                  style={modalStyles.title}
                  className="text-[22px] font-urbanist-bold text-primary mb-1"
                >
                  Quick Actions
                </Text>
                <Text
                  style={modalStyles.subtitle}
                  className="text-[14px] font-urbanist-medium text-secondary"
                >
                  What would you like to create?
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) { }
                  onClose();
                }}
                style={modalStyles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={18} color="#6B7280" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={modalStyles.listContainer}>
              {ACTION_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={modalStyles.actionItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch (e) { }
                    onClose();
                    if (item.id === 'create_batch') {
                      router.push('/(tabs)/batches/add' as any);
                    } else if (item.id === 'add_student') {
                      router.push('/(tabs)/students/add' as any);
                    } else if (item.id === 'import_student') {
                      setIsBulkImportOpen(true);
                    }
                  }}
                >
                  <View style={[modalStyles.iconContainer, { backgroundColor: item.bgColor }]}>
                    <item.icon size={22} color={item.color} variant="Linear" />
                  </View>
                  <View style={modalStyles.textContainer}>
                    <Text
                      style={modalStyles.itemTitle}
                      className="text-[15px] font-urbanist-semibold text-[#18181B] mb-0.5"
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={modalStyles.itemDescription}
                      className="text-[13px] font-urbanist-medium text-[#8E8E93]"
                    >
                      {item.description}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Bulk Student Import Modal */}
      <BulkImportModal
        visible={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={(batchId, batchName) => {
          setIsBulkImportOpen(false);
          if (batchId) {
            try {
              router.push({
                pathname: '/(tabs)/batches/StudentListScreen',
                params: { id: batchId, title: batchName, from: 'students' },
              } as any);
            } catch (e) { }
          }
        }}
      />
    </>
  );
}

const modalStyles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFill as any,
    zIndex: 99999,
    elevation: 99999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 4,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragArea: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 22,
    color: '#333333',
  },
  subtitle: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 14,
    color: '#626262',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  listContainer: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F2EEF4',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 15,
    color: '#18181B',
  },
  itemDescription: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#8E8E93',
  },
});