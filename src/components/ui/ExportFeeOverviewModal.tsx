import PrimaryBtn from '@/components/ui/PrimaryBtn';
import { useBatchesList } from '@/hooks/use-batches';
import styles, { COLORS } from '@/styles/styles';
import { Batch } from '@/types/batch';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import {
  Calendar,
  ExportCurve,
  ReceiveSquare,
  RotateLeft
} from 'iconsax-react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

export type ExportFormatType = 'xlsx' | 'pdf' | 'csv';
export type ExportFeeStatusType = 'all' | 'paid' | 'overdue' | 'due_today' | 'unpaid';
export type ExportPaymentMethodType = 'all' | 'upi' | 'cash' | 'card';

export interface ExportFeeOverviewFilterValues {
  format: ExportFormatType;
  feeStatus: ExportFeeStatusType;
  paymentMethod: ExportPaymentMethodType;
  batchId: number | string | null;
  month: number | null;
  year: number | null;
}

export interface ExportFeeOverviewModalProps {
  visible: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onExport: (values: ExportFeeOverviewFilterValues, actionType: 'download' | 'share') => void;
}

const FORMAT_OPTIONS: {
  id: ExportFormatType;
  label: string;
  ext: string;
  iconSource: any;
  description: string;
}[] = [
    {
      id: 'xlsx',
      label: 'Excel Spreadsheet',
      ext: '.xlsx',
      iconSource: require('../../../assets/icons/xl.png'),
      description: 'Detailed financial overview, collection & student breakdown',
    },
    {
      id: 'pdf',
      label: 'PDF Document',
      ext: '.pdf',
      iconSource: require('../../../assets/icons/pdfIcon.svg'),
      description: 'Printable fee summary & collection statement',
    },
    {
      id: 'csv',
      label: 'CSV Data File',
      ext: '.csv',
      iconSource: require('../../../assets/icons/csv.png'),
      description: 'Raw accounting table data for spreadsheets',
    },
  ];

const FEE_STATUS_FILTERS: { id: ExportFeeStatusType; label: string }[] = [
  { id: 'all', label: 'All Fees' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'due_today', label: 'Due Today' },
  { id: 'unpaid', label: 'Unpaid' },
];

const PAYMENT_METHOD_FILTERS: { id: ExportPaymentMethodType; label: string }[] = [
  { id: 'all', label: 'All ' },
  { id: 'upi', label: 'UPI' },
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
];

const MONTH_OPTIONS = [
  { id: null, label: 'All Months' },
  { id: 1, label: 'Jan' },
  { id: 2, label: 'Feb' },
  { id: 3, label: 'Mar' },
  { id: 4, label: 'Apr' },
  { id: 5, label: 'May' },
  { id: 6, label: 'Jun' },
  { id: 7, label: 'Jul' },
  { id: 8, label: 'Aug' },
  { id: 9, label: 'Sep' },
  { id: 10, label: 'Oct' },
  { id: 11, label: 'Nov' },
  { id: 12, label: 'Dec' },
];

export default function ExportFeeOverviewModal({
  visible,
  isLoading = false,
  onClose,
  onExport,
}: ExportFeeOverviewModalProps) {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);
  const { data: batches = [] } = useBatchesList();

  const [selectedFormat, setSelectedFormat] = useState<ExportFormatType>('xlsx');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState<ExportFeeStatusType>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<ExportPaymentMethodType>('all');
  const [selectedBatchId, setSelectedBatchId] = useState<number | string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const [activeAction, setActiveAction] = useState<'download' | 'share' | null>(null);

  const [showModal, setShowModal] = useState(visible);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
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
        if (gestureState.dy > 70 || gestureState.vy > 0.35) {
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
      } catch (e) { }
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
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal) return null;

  const handleResetFilters = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) { }
    setSelectedFormat('xlsx');
    setSelectedFeeStatus('all');
    setSelectedPaymentMethod('all');
    setSelectedBatchId(null);
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  };

  const handleExportPress = (actionType: 'download' | 'share') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) { }
    setActiveAction(actionType);
    onExport(
      {
        format: selectedFormat,
        feeStatus: selectedFeeStatus,
        paymentMethod: selectedPaymentMethod,
        batchId: selectedBatchId,
        month: selectedMonth,
        year: selectedYear,
      },
      actionType
    );
  };

  const isCustomized =
    selectedFormat !== 'xlsx' ||
    selectedFeeStatus !== 'all' ||
    selectedPaymentMethod !== 'all' ||
    selectedBatchId !== null ||
    selectedMonth !== currentMonth ||
    selectedYear !== currentYear;

  return (
    <Modal
      visible={showModal}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={sheetStyles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[sheetStyles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={sheetStyles.backdropTouch}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Modal Container */}
        <Animated.View
          style={[
            sheetStyles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={sheetStyles.dragArea}>
            <View style={sheetStyles.dragHandle} />
          </View>

          {/* Modal Header */}
          <View className="px-6 pb-4 border-b border-primary-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-[20px] font-urbanist-bold text-primary tracking-tight">
                  Export Fee Overview
                </Text>
                <Text className="text-[13px] font-urbanist-medium text-secondary tracking-tight mt-0.5" numberOfLines={1}>
                  Export financial & fee collection statement
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                {isCustomized && (
                  <TouchableOpacity
                    onPress={handleResetFilters}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-1 py-1.5 px-2.5 rounded-full bg-[#F3F4F6]"
                  >
                    <RotateLeft size={14} color={COLORS.secondary} />
                    <Text className="text-[12px] font-urbanist-bold text-secondary">Reset</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  className="w-9 h-9 rounded-full bg-[#F3F4F6] items-center justify-center"
                >
                  <X size={18} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={sheetStyles.scrollView}
            contentContainerStyle={sheetStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled={true}
          >
            {/* 1. File Format */}
            <View>
              <Text className="text-[13px] font-urbanist-bold text-secondary uppercase tracking-wider mb-2.5">
                Select File Format
              </Text>
              <View className="gap-2.5">
                {FORMAT_OPTIONS.map((opt) => {
                  const isSelected = selectedFormat === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch (e) { }
                        setSelectedFormat(opt.id);
                      }}
                      className={`flex-row items-center p-3 rounded-[16px] border ${isSelected
                          ? 'bg-[#EFF6FF] border-[#4186F7]'
                          : 'bg-[#FAFAFA] border-primary-border'
                        }`}
                    >
                      <View className="w-11 h-11 rounded-[12px] bg-white border border-primary-border items-center justify-center mr-3 shadow-sm">
                        <Image
                          source={opt.iconSource}
                          style={{ width: 26, height: 26 }}
                          contentFit="contain"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-[15px] font-urbanist-bold text-primary">
                          {opt.label} <Text className="text-secondary font-urbanist-medium text-[13px]">{opt.ext}</Text>
                        </Text>
                        <Text className="text-[12px] font-urbanist-medium text-secondary" numberOfLines={1}>
                          {opt.description}
                        </Text>
                      </View>

                      <View
                        className={`w-5 h-5 rounded-full border items-center justify-center ${isSelected
                            ? 'border-[#4186F7] bg-[#4186F7]'
                            : 'border-[#D1D5DB] bg-white'
                          }`}
                      >
                        {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 2. Fee Status Filter */}
            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[13px] font-urbanist-bold text-secondary uppercase tracking-wider">
                  Fee Status
                </Text>
                {selectedFeeStatus !== 'all' && (
                  <Text className="text-[12px] font-urbanist-bold text-[#4186F7]">
                    {selectedFeeStatus.toUpperCase()}
                  </Text>
                )}
              </View>
              <View className="flex-row flex-wrap gap-2">
                {FEE_STATUS_FILTERS.map((st) => {
                  const isSelected = selectedFeeStatus === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch (e) { }
                        setSelectedFeeStatus(st.id);
                      }}
                      activeOpacity={0.8}
                      className={`py-2 px-3.5 rounded-[12px] border items-center justify-center ${isSelected
                          ? 'bg-[#4186F7] border-[#4186F7]'
                          : 'bg-[#FAFAFA] border-primary-border'
                        }`}
                    >
                      <Text
                        className={`text-[13px] ${isSelected ? 'font-urbanist-bold text-white' : 'font-urbanist-medium text-primary'
                          }`}
                      >
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Payment Method Filter */}
            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[13px] font-urbanist-bold text-secondary uppercase tracking-wider">
                  Payment Method
                </Text>
                {selectedPaymentMethod !== 'all' && (
                  <Text className="text-[12px] font-urbanist-bold text-[#4186F7]">
                    {selectedPaymentMethod.toUpperCase()}
                  </Text>
                )}
              </View>
              <View className="flex-row gap-2">
                {PAYMENT_METHOD_FILTERS.map((pm) => {
                  const isSelected = selectedPaymentMethod === pm.id;
                  return (
                    <TouchableOpacity
                      key={pm.id}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch (e) { }
                        setSelectedPaymentMethod(pm.id);
                      }}
                      activeOpacity={0.8}
                      className={`flex-1 py-2 px-3 rounded-[12px] border items-center justify-center ${isSelected
                          ? 'bg-[#4186F7] border-[#4186F7]'
                          : 'bg-[#FAFAFA] border-primary-border'
                        }`}
                    >
                      <Text
                        className={`text-[13px] ${isSelected ? 'font-urbanist-bold text-white' : 'font-urbanist-medium text-primary'
                          }`}
                      >
                        {pm.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Batch Filter (Optional) */}
            {batches && batches.length > 0 && (
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[13px] font-urbanist-bold text-secondary uppercase tracking-wider">
                    Filter by Batch
                  </Text>
                  {selectedBatchId !== null && (
                    <TouchableOpacity onPress={() => setSelectedBatchId(null)} activeOpacity={0.7}>
                      <Text className="text-[12px] font-urbanist-bold text-[#4186F7]">
                        All Batches
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, paddingRight: 8 }}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedBatchId(null)}
                    activeOpacity={0.8}
                    className={`py-1.5 px-3 rounded-[10px] border items-center justify-center ${selectedBatchId === null
                        ? 'bg-black border-black'
                        : 'bg-white border-primary-border'
                      }`}
                  >
                    <Text
                      className={`text-[12px] ${selectedBatchId === null
                          ? 'font-urbanist-bold text-white'
                          : 'font-urbanist-medium text-[#475569]'
                        }`}
                    >
                      All Batches
                    </Text>
                  </TouchableOpacity>
                  {batches.map((b: Batch) => {
                    const isSelected = selectedBatchId === b.id;
                    return (
                      <TouchableOpacity
                        key={String(b.id)}
                        onPress={() => {
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          } catch (e) { }
                          setSelectedBatchId(b.id);
                        }}
                        activeOpacity={0.8}
                        className={`py-1.5 px-3 rounded-[10px] border items-center justify-center ${isSelected
                            ? 'bg-black border-black'
                            : 'bg-white border-primary-border'
                          }`}
                      >
                        <Text
                          className={`text-[12px] ${isSelected
                              ? 'font-urbanist-bold text-white'
                              : 'font-urbanist-medium text-[#475569]'
                            }`}
                        >
                          {b.batch_name || `Batch ${b.id}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* 5. Target Fee Period */}
            <View className="p-3.5 rounded-[18px] bg-[#F8FAFC] border border-primary-border gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Calendar size={16} color={COLORS.secondary} />
                  <Text className="text-[13px] font-urbanist-bold text-secondary uppercase tracking-wider">
                    Target Fee Period
                  </Text>
                </View>
                {selectedMonth !== null ? (
                  <TouchableOpacity
                    onPress={() => setSelectedMonth(null)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-[12px] font-urbanist-bold text-[#4186F7]">
                      Reset to All Months
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Month Selector Chips */}
              <View>
                <Text className="text-[12px] font-urbanist-semibold text-[#64748B] mb-2">
                  Month
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, paddingRight: 8 }}
                >
                  {MONTH_OPTIONS.map((m) => {
                    const isSelected = selectedMonth === m.id;
                    return (
                      <TouchableOpacity
                        key={String(m.id)}
                        onPress={() => {
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          } catch (e) { }
                          setSelectedMonth(m.id);
                        }}
                        activeOpacity={0.8}
                        className={`py-1.5 px-3 rounded-[10px] border items-center justify-center ${isSelected
                            ? 'bg-black border-black'
                            : 'bg-white border-primary-border'
                          }`}
                      >
                        <Text
                          className={`text-[12px] ${isSelected
                              ? 'font-urbanist-bold text-white'
                              : 'font-urbanist-medium text-[#475569]'
                            }`}
                        >
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Year Selector */}
              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-[12px] font-urbanist-semibold text-[#64748B]">
                  Year
                </Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (e) { }
                      setSelectedYear((prev) => (prev ? prev - 1 : currentYear - 1));
                    }}
                    activeOpacity={0.7}
                    className="w-7 h-7 rounded-[8px] bg-white border border-primary-border items-center justify-center"
                  >
                    <ChevronLeft size={16} color="#475569" />
                  </TouchableOpacity>

                  <View className="px-3 py-1 rounded-[8px] bg-white border border-primary-border">
                    <Text className="text-[13px] font-urbanist-bold text-primary">
                      {selectedYear ?? currentYear}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (e) { }
                      setSelectedYear((prev) => (prev ? prev + 1 : currentYear + 1));
                    }}
                    activeOpacity={0.7}
                    className="w-7 h-7 rounded-[8px] bg-white border border-primary-border items-center justify-center"
                  >
                    <ChevronRight size={16} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Button Bar with Download and Share */}
          <View className="px-6 pt-3 pb-2 border-t border-primary-border gap-2.5 flex-row items-center h-fit">
            {/* Primary Action: Download Report */}
            <View className="flex-1">
              <PrimaryBtn
                label={isLoading && activeAction === 'download' ? 'Downloading...' : `Download Report (${selectedFormat.toUpperCase()})`}
                onPress={() => handleExportPress('download')}
                disabled={isLoading}
                loading={isLoading && activeAction === 'download'}
                icon={ReceiveSquare}
                className="h-[52px]"
              />
            </View>

            {/* Secondary Action: Short Share Icon Button */}
            <TouchableOpacity
              onPress={() => handleExportPress('share')}
              disabled={isLoading}
              activeOpacity={0.8}
              style={[styles.BlackInnerShadowStyle]}
              className="w-[52px] h-[52px] rounded-[16px] bg-white border border-primary-border items-center justify-center"
            >
              {isLoading && activeAction === 'share' ? (
                <ActivityIndicator size="small" color="#333333" />
              ) : (
                <ExportCurve size={22} color="#626262" variant="Linear" />
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 44 : 20,
    maxHeight: height * 0.88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 24,
  },
  dragArea: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 18,
  },
});
