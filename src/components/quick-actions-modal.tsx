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
        <View style={styles.overlayWrapper}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.backdropTouch}
              activeOpacity={1}
              onPress={onClose}
            />
          </Animated.View>

          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.dragArea}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Quick Actions</Text>
                <Text style={styles.subtitle}>What would you like to create?</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={18} color="#6B7280" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
              {ACTION_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.actionItem}
                  activeOpacity={0.7}
                  onPress={() => {
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
                  <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                    <item.icon size={22} color={item.color} variant="Linear" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </View>
                  <ChevronRight size={16} color="#D1D5DB" strokeWidth={2} />
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
            } catch (e) {}
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  itemDescription: {
    fontSize: 12.5,
    color: '#9CA3AF',
    letterSpacing: -0.1,
  },
});
