import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
  BackHandler,
  Keyboard,
} from 'react-native';
import { MessageQuestion, Star1 } from 'iconsax-react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

export interface FeedbackBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; rating: number; message: string }) => void;
}

const CATEGORIES = ['General Feedback', 'Report an Issue', 'Feature Request', 'Attendance Query'];

export default function FeedbackBottomSheet({
  visible,
  onClose,
  onSubmit,
}: FeedbackBottomSheetProps) {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const keyboardShiftAnim = useRef(new Animated.Value(0)).current;

  // Smooth animated shift when keyboard opens/closes
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const kbHeight = e.endCoordinates.height;
        setKeyboardHeight(kbHeight);
        Animated.timing(keyboardShiftAnim, {
          toValue: -kbHeight,
          duration: Platform.OS === 'ios' ? (e.duration || 250) : 180,
          useNativeDriver: true,
        }).start();
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        setKeyboardHeight(0);
        Animated.timing(keyboardShiftAnim, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? (e.duration || 250) : 180,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const closeModal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    Keyboard.dismiss();

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      setMessage('');
      setRating(0);
      setKeyboardHeight(0);
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 2 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 3 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          const opacity = Math.max(0, 1 - gestureState.dy / (height * 0.45));
          fadeAnim.setValue(opacity);
        } else {
          slideAnim.setValue(gestureState.dy * 0.15);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 70 || gestureState.vy > 0.35) {
          closeModal();
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
              tension: 68,
              friction: 10,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 180,
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      setShowModal(true);
      setRating(0);
      setMessage('');
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      keyboardShiftAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 24,
          mass: 0.8,
          stiffness: 120,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (showModal) {
      closeModal();
    }
  }, [visible]);

  useEffect(() => {
    if (!showModal) return;
    const backAction = () => {
      closeModal();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [showModal]);

  const handleSubmit = () => {
    if (!message.trim()) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
      return;
    }
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit({ category, rating, message });
      closeModal();
    }, 400);
  };

  if (!showModal && !visible) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <View style={sheetStyles.overlay}>
        {/* Backdrop Tap */}
        <Animated.View
          style={[
            sheetStyles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.55],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeModal}
          />
        </Animated.View>

        {/* Bottom Sheet Card */}
        <Animated.View
          style={[
            sheetStyles.sheetCard,
            {
              maxHeight: keyboardHeight > 0 ? height - keyboardHeight - 20 : height * 0.88,
              transform: [
                { translateY: slideAnim },
                { translateY: keyboardShiftAnim },
              ],
            },
          ]}
        >
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={sheetStyles.handleContainer}>
            <View style={sheetStyles.handle} />
          </View>

          {/* Header */}
          <View style={sheetStyles.header}>
            <View style={sheetStyles.titleRow}>
              <View style={sheetStyles.iconBox}>
                <MessageQuestion size={20} color="#2563EB" variant="Bold" />
              </View>
              <View>
                <Text style={sheetStyles.sheetTitle}>Send Feedback</Text>
                <Text style={sheetStyles.sheetSubtitle}>
                  Help us make Skating Academy better
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={closeModal}
              style={sheetStyles.closeBtn}
            >
              <X size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView
            ref={scrollViewRef}
            style={sheetStyles.scrollContent}
            contentContainerStyle={sheetStyles.scrollInner}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Category selection */}
            <Text style={sheetStyles.label}>Select Category</Text>
            <View style={sheetStyles.categoryWrap}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.7}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (e) {}
                      setCategory(cat);
                    }}
                    style={[
                      sheetStyles.catPill,
                      isSelected && sheetStyles.catPillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        sheetStyles.catText,
                        isSelected
                          ? sheetStyles.catTextSelected
                          : sheetStyles.catTextUnselected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Rating Stars */}
            <View style={sheetStyles.ratingHeaderRow}>
              <Text style={[sheetStyles.label, { marginBottom: 0 }]}>
                How would you rate your experience?
              </Text>
              {rating > 0 ? (
                <Text style={sheetStyles.ratingFeedbackText}>
                  {rating === 5
                    ? 'Excellent 🌟'
                    : rating === 4
                    ? 'Very Good 👍'
                    : rating === 3
                    ? 'Good 🙂'
                    : rating === 2
                    ? 'Fair 😐'
                    : 'Poor 🙁'}
                </Text>
              ) : (
                <Text style={sheetStyles.ratingOptionalText}>(Optional)</Text>
              )}
            </View>

            <View style={sheetStyles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = star <= rating && rating > 0;
                return (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (e) {}
                      setRating(star === rating ? 0 : star);
                    }}
                    style={sheetStyles.starBtn}
                  >
                    <Star1
                      size={30}
                      color={isSelected ? '#F59E0B' : '#D1D5DB'}
                      variant={isSelected ? 'Bold' : 'Linear'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Message Input */}
            <Text style={[sheetStyles.label, { marginTop: 16 }]}>Your Message or Suggestion</Text>
            <TextInput
              style={sheetStyles.textInput}
              placeholder="Tell us what's working well or how we can improve..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
            />
          </ScrollView>

          {/* Submit Button */}
          <View style={sheetStyles.footerContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              style={[
                sheetStyles.submitBtn,
                !message.trim() && sheetStyles.submitBtnDisabled,
              ]}
            >
              <Text style={sheetStyles.submitBtnText}>
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
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
    backgroundColor: '#000000',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 20,
  },
  handleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EEF4',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 17,
    color: '#1F2937',
  },
  sheetSubtitle: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scrollInner: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  label: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catPillSelected: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  catText: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 12,
  },
  catTextUnselected: {
    color: '#4B5563',
  },
  catTextSelected: {
    fontFamily: 'Urbanist_700Bold',
    color: '#FFFFFF',
  },
  ratingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
  },
  ratingFeedbackText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 12,
    color: '#D97706',
  },
  ratingOptionalText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 11,
    color: '#9CA3AF',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  starBtn: {
    padding: 4,
  },
  textInput: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    height: 100,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2EEF4',
  },
  submitBtn: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
