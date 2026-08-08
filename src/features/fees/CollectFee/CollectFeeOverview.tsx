import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Setting2, TickCircle } from 'iconsax-react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import PrimaryBtn from '@/components/ui/PrimaryBtn';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

import CollectFeeStudentCard, { CollectFeeStudentInfo } from './CollectFeeStudentCard';
import CollectFeeAmountCard from './CollectFeeAmountCard';
import CollectFeePaymentMethodCard, { PaymentMethodType } from './CollectFeePaymentMethodCard';

export interface CollectFeeOverviewProps {
  student?: CollectFeeStudentInfo;
  onBackPress?: () => void;
  onConfirmSuccess?: (data: {
    student?: CollectFeeStudentInfo;
    discount: string;
    lateFine: string;
    netPayable: string;
    paymentMethod: PaymentMethodType;
    notes: string;
  }) => void;
}

const DEFAULT_STUDENT: CollectFeeStudentInfo = {
  id: '1',
  name: 'Sharma',
  studentId: 'ID: SA-2024-0892',
  location: 'Sathya Stadium',
  dueAmount: '₹1,200',
  dueLabel: 'Due Today',
};

export default function CollectFeeOverview({
  student = DEFAULT_STUDENT,
  onBackPress,
  onConfirmSuccess,
}: CollectFeeOverviewProps) {
  // Hide tab bar while on Collect Fee screen
  const { hideTabBar, showTabBar } = useTabBarVisibility();

  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);

  const [discount, setDiscount] = useState('');
  const [lateFine, setLateFine] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('CASH');
  const [notes, setNotes] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<Animated.ScrollView>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleNotesFocus = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  // Calculate Net Payable amount dynamically
  const netPayable = useMemo(() => {
    const parseNumber = (val: string) => {
      const cleaned = val.replace(/[^0-9]/g, '');
      return parseInt(cleaned, 10) || 0;
    };

    const baseAmount = parseNumber(student.dueAmount || '₹1,200');
    const discountVal = parseNumber(discount);
    const lateFineVal = parseNumber(lateFine);

    const total = Math.max(0, baseAmount - discountVal + lateFineVal);
    return `₹${total.toLocaleString('en-IN')}`;
  }, [student.dueAmount, discount, lateFine]);

  const handleConfirm = () => {
    if (isLoading || showToast) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        if (onConfirmSuccess) {
          onConfirmSuccess({
            student,
            discount: discount || '₹0',
            lateFine: lateFine || '₹0',
            netPayable,
            paymentMethod: selectedMethod,
            notes,
          });
        } else {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/fees' as any);
          }
        }
      }, 2500);
    }, 600);
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/fees' as any);
    }
  };

  return (
    <ScreenWrapper className="bg-[#F8F9FB] flex-1">
      {/* Success Toast Notification */}
      {showToast && (
        <Animated.View
          entering={FadeInUp.duration(250)}
          exiting={FadeOutUp.duration(200)}
          className="absolute top-12 left-5 right-5 z-50 bg-[#167D44] rounded-[18px] p-4 flex-row items-center gap-3 shadow-lg"
        >
          <TickCircle size={24} color="#FFFFFF" variant="Bold" />
          <View className="flex-1">
            <Text className="text-[15px] font-urbanist-bold text-white">
              Payment Collected Successfully!
            </Text>
            <Text className="text-[12px] font-urbanist-medium text-white/90">
              Collected {netPayable} via {selectedMethod} for {student.name}.
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Header with Back, Title, and Settings right icon */}
      <Header
        variant="page"
        title="Collect Fee"
        showBack={true}
        onBackPress={handleBack}
        rightIcon={Setting2}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Main Content Area */}
        <Animated.ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5 pt-3"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: keyboardHeight > 0 ? 300 : 120,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          overScrollMode="always"
          bounces={true}
          alwaysBounceVertical={true}
          decelerationRate="normal"
          scrollEventThrottle={16}
        >
          <View className="gap-4">
            {/* Card 1: Student Information */}
            <CollectFeeStudentCard student={student} />

            {/* Card 2: Amount to Collect Details */}
            <CollectFeeAmountCard
              amount={student.dueAmount || '₹1,200'}
              feePeriodLabel="July 2026 Monthly Fee"
              discount={discount}
              onDiscountChange={setDiscount}
              lateFine={lateFine}
              onLateFineChange={setLateFine}
              netPayable={netPayable}
            />

            {/* Card 3: Payment Method Selection & Notes */}
            <CollectFeePaymentMethodCard
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
              notes={notes}
              onNotesChange={setNotes}
              onNotesFocus={handleNotesFocus}
            />
          </View>
        </Animated.ScrollView>

        {/* Bottom Sticky Action Bar: Confirm Button */}
        <View className="px-5 pb-6 pt-3 bg-[#F8F9FB] border-t border-primary-border/40">
          <PrimaryBtn
            label={`Confirm ${netPayable}`}
            variant="green"
            loading={isLoading}
            disabled={isLoading}
            onPress={handleConfirm}
            className="rounded-[20px] py-4"
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
