import { router } from 'expo-router';
import { ClipboardText, DocumentText1, NotificationBing, Teacher } from 'iconsax-react-native';
import { ChevronRight, X } from 'lucide-react-native';
import React from 'react';
import { Animated, Dimensions, Modal, PanResponder, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionsModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

const ACTION_ITEMS = [
  {
    id: 'assignment',
    title: 'Assignment',
    description: 'Create a new assignment for students.',
    icon: ClipboardText,
    color: '#3B82F6', // Blue
    bgColor: '#EFF6FF',
  },
  {
    id: 'test',
    title: 'Test',
    description: 'Set up a new test or quiz.',
    icon: Teacher,
    color: '#F59E0B', // Orange
    bgColor: '#FEF3C7',
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Upload new study materials.',
    icon: DocumentText1,
    color: '#8B5CF6', // Purple
    bgColor: '#F5F3FF',
  },
  {
    id: 'announcement',
    title: 'Announcement',
    description: 'Broadcast a message to the class.',
    icon: NotificationBing,
    color: '#F97316', // Orange/Peach
    bgColor: '#FFF7ED',
  },
];

export default function QuickActionsModal({ visible, onClose }: QuickActionsModalProps) {
  const [showModal, setShowModal] = React.useState(visible);
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Catch touches on empty spaces immediately!
      onStartShouldSetPanResponderCapture: () => false, // Let buttons be clicked
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 2 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 2 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          // Fade out background slightly as you drag down
          const opacity = Math.max(0, 1 - (gestureState.dy / (height / 2)));
          fadeAnim.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.3) {
          // Animate fully off-screen with the velocity of the swipe
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
            })
          ]).start(() => {
            onClose();
          });
        } else {
          // Spring back smoothly
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
            })
          ]).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
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
        })
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
        })
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
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
            { transform: [{ translateY: slideAnim }] }
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
                  if (item.id === 'test') {
                    router.push('/(tabs)/batches/index' as any);
                  } else if (item.id === 'assignment') {
                    router.push('/(tabs)/students/index' as any);
                  } else if (item.id === 'announcement') {
                    router.push('/(tabs)/notifications/index' as any);
                  } else if (item.id === 'resources') {
                    router.push('/(tabs)/reports/index' as any);
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
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
