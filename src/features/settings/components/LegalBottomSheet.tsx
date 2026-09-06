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
  ScrollView,
  BackHandler,
} from 'react-native';
import {  DocumentText1, ShieldTick } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export interface LegalBottomSheetProps {
  visible: boolean;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export default function LegalBottomSheet({
  visible,
  type,
  onClose,
}: LegalBottomSheetProps) {
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const closeModal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

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
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  // Seamless 1:1 free drag PanResponder for smooth bottom-sheet swipe to dismiss
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
    if (visible && type) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      setShowModal(true);
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
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
  }, [visible, type]);

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

  if (!showModal && !visible) return null;

  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';

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
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={sheetStyles.handleContainer}>
            <View style={sheetStyles.handle} />
          </View>

          {/* Sheet Header */}
          <View style={sheetStyles.header}>
            <View style={sheetStyles.titleRow}>
              <View
                style={[
                  sheetStyles.iconBox,
                  { backgroundColor: isPrivacy ? '#EFF6FF' : '#F5F3FF' },
                ]}
              >
                {isPrivacy ? (
                  <ShieldTick size={20} color="#2563EB" variant="Bold" />
                ) : (
                  <DocumentText1 size={20} color="#7C3AED" variant="Bold" />
                )}
              </View>
              <View>
                <Text style={sheetStyles.sheetTitle}>{title}</Text>
                <Text style={sheetStyles.sheetSubtitle}>
                  Last updated: September 2026
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

          {/* Scrollable Legal Content */}
          <ScrollView
            style={sheetStyles.scrollContent}
            contentContainerStyle={sheetStyles.scrollInner}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {isPrivacy ? (
              <View style={sheetStyles.contentStack}>
                <Text style={sheetStyles.introText}>
                  Welcome to Skating Academy. We respect your privacy and are committed to protecting the personal data of students, parents, coaches, and administrators.
                </Text>

                <View style={sheetStyles.sectionCard}>
                  <Text style={sheetStyles.sectionHeading}>
                    1. Information We Collect
                  </Text>
                  <Text style={sheetStyles.bodyText}>
                    • Student Details: Full name, Date of Birth, Blood Group, Guardian names, and Emergency contacts.{'\n'}
                    • Session & Attendance: Live attendance records, scheduled training days, and compensation logs.{'\n'}
                    • Fee & Transaction Logs: Monthly dues, collected amounts, payment modes, and invoice notes.
                  </Text>
                </View>

                <View style={sheetStyles.sectionCard}>
                  <Text style={sheetStyles.sectionHeading}>
                    2. Purpose of Processing
                  </Text>
                  <Text style={sheetStyles.bodyText}>
                    All collected data is utilized exclusively to manage skating batches, track student progress, coordinate training schedules, generate payment receipts, and compile administrative reports.
                  </Text>
                </View>

                <View style={sheetStyles.sectionCard}>
                  <Text style={sheetStyles.sectionHeading}>
                    3. Data Security & Storage
                  </Text>
                  <Text style={sheetStyles.bodyText}>
                    Your data is secured through enterprise-grade SSL/TLS encryption in transit and secure database vaults at rest. We never share or sell student data to third-party advertisers.
                  </Text>
                </View>

                <View style={sheetStyles.sectionCard}>
                  <Text style={sheetStyles.sectionHeading}>
                    4. Your Rights
                  </Text>
                  <Text style={sheetStyles.bodyText}>
                    Authorized coaches and guardians may request access to, correction of, or deletion of student records at any time through our designated support channels.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={sheetStyles.contentStack}>
                <Text style={sheetStyles.introText}>
                  By accessing or using the Skating Academy app, you agree to adhere to and be bound by the terms, conditions, and policies set forth below.
                </Text>

                <View style={sheetStyles.sectionCard}>
                  <Text style={sheetStyles.sectionHeading}>
                    1. Authorized Academy Use
                  </Text>
                  <Text style={sheetStyles.bodyText}>
                    This software is intended solely for authorized coaches, trainers, and academy staff. Instructors are responsible for maintaining the confidentiality of their credentials and session notes.
                  </Text>
                </View>

                <View style={sheetStyles.sectionCard}>
                  <Text style={sheetStyles.sectionHeading}>
                    2. Record Accuracy & Compliance
                  </Text>
                  <Text style={sheetStyles.bodyText}>
                    Instructors must ensure all recorded attendance, student details, and collected fee amounts are accurate and up to date to ensure seamless academy operations.
                  </Text>
                </View>

                <View style={sheetStyles.sectionCard}>
                  <Text style={sheetStyles.sectionHeading}>
                    3. Health & Safety Disclaimer
                  </Text>
                  <Text style={sheetStyles.bodyText}>
                    Skating Academy provides digital management tooling. Skating training involves physical exertion; coaches and academies remain solely responsible for on-ground safety protocols, safety gear, and emergency care.
                  </Text>
                </View>

                <View style={sheetStyles.sectionCard}>
                  <Text style={sheetStyles.sectionHeading}>
                    4. Service Modifications
                  </Text>
                  <Text style={sheetStyles.bodyText}>
                    We continuously improve our platform. Updates, features, and performance enhancements may be published periodically to deliver the best experience.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Dismiss Action */}
          <View style={sheetStyles.footerContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={closeModal}
              style={sheetStyles.gotItButton}
            >
              <Text style={sheetStyles.gotItButtonText}>Understood & Close</Text>
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
    maxHeight: height * 0.84,
    minHeight: height * 0.55,
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
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollInner: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  contentStack: {
    gap: 14,
  },
  introText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F2EEF4',
  },
  sectionHeading: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 6,
  },
  bodyText: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2EEF4',
  },
  gotItButton: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItButtonText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
