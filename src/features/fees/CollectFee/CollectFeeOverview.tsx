import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard, Text, BackHandler } from 'react-native';
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
import { useCollectFee } from '@/hooks/use-fees';

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


export default function CollectFeeOverview({
  student: providedStudent,
  onBackPress,
  onConfirmSuccess,
}: CollectFeeOverviewProps) {
  const student = providedStudent || {};

  // Default to current month (1-12) and current year
  const currentDate = useMemo(() => new Date(), []);
  const [feeMonth, setFeeMonth] = useState<number>(currentDate.getMonth() + 1);
  const [feeYear, setFeeYear] = useState<number>(currentDate.getFullYear());

  // Hide tab bar while on Collect Fee screen (optimized effect)
  const { hideTabBar, showTabBar } = useTabBarVisibility();

  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, []);

  const [discount, setDiscount] = useState('');
  const [lateFine, setLateFine] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('CASH');
  const [notes, setNotes] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const collectFeeMutation = useCollectFee();

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

  // Handle hardware back press on Android
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBackPress]);

  const handleNotesFocus = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Calculate Net Payable amount dynamically
  const netPayable = useMemo(() => {
    const parseNumber = (val: string) => {
      const cleaned = val.replace(/[^0-9]/g, '');
      return parseInt(cleaned, 10) || 0;
    };

    const baseAmount = parseNumber(student.dueAmount || '0');
    const discountVal = parseNumber(discount);
    const lateFineVal = parseNumber(lateFine);

    const total = Math.max(0, baseAmount - discountVal + lateFineVal);
    return `₹${total.toLocaleString('en-IN')}`;
  }, [student.dueAmount, discount, lateFine]);

  const handleConfirm = async () => {
    if (isLoading || showToast || collectFeeMutation.isPending) return;

    const parseNumber = (val: string) => {
      const cleaned = val.replace(/[^0-9]/g, '');
      return parseInt(cleaned, 10) || 0;
    };

    const baseAmountNum = parseNumber(student.dueAmount || '0');
    const discountNum = parseNumber(discount);
    const lateFineNum = parseNumber(lateFine);
    const netPayableNum = parseNumber(netPayable);

    const studentIdNum = Number(student.id) || 1;

    try {
      setIsLoading(true);
      await collectFeeMutation.mutateAsync({
        student_id: studentIdNum,
        base_amount: baseAmountNum,
        fee_month: feeMonth,
        fee_year: feeYear,
        discount: discountNum,
        late_fine: lateFineNum,
        net_payable: netPayableNum,
        payment_method: selectedMethod,
        notes: notes.trim(),
      });

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
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert(
        'Collection Failed',
        error?.response?.data?.message || error?.message || 'Failed to collect fee. Please try again.'
      );
    }
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
    <ScreenWrapper>
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
              Collected {netPayable} via {selectedMethod} for {student.name || 'Student'}.
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
              amount={student.dueAmount || '₹0'}
              feeMonth={feeMonth}
              onFeeMonthChange={setFeeMonth}
              feeYear={feeYear}
              onFeeYearChange={setFeeYear}
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
