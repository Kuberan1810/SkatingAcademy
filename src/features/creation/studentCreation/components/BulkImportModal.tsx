import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import {
  TickCircle,
  Danger,
  DocumentText,
  ArrowDown2,
  Teacher,
  Warning2,
} from 'iconsax-react-native';
import {
  usePreviewStudentImport,
  usePreviewStudentImportText,
  useConfirmStudentImport,
} from '@/hooks/use-students';
import { useBatchesList } from '@/hooks/use-batches';
import { getErrorMessage } from '@/utils/error';
import PrimaryBtn from '@/components/ui/PrimaryBtn';
import Toast from '@/components/ui/Toast';
import { CloudDownload, X } from 'lucide-react-native';
import styles from '@/styles/styles';

const { height } = Dimensions.get('window');

export interface BulkImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (batchId?: number, batchName?: string) => void;
}

/**
 * Reusable Stat Card matching AttendanceSummarySheet.tsx design
 */
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
      className="flex-1 border rounded-[24px] p-2.5 min-h-[86px] items-center justify-center"
    >
      <Text
        style={{ color: titleColor }}
        className="text-[11px] font-urbanist-bold tracking-wider uppercase text-center mb-1"
      >
        {title}
      </Text>
      <Text
        style={{ color: valueColor }}
        className="text-[24px] font-urbanist-bold text-center tracking-tight"
      >
        {value}
      </Text>
    </View>
  );
}

export default function BulkImportModal({
  visible,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const [showModal, setShowModal] = useState(visible);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [importMode, setImportMode] = useState<'file' | 'text'>('file');

  // File state
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    type?: string;
  } | null>(null);

  // Text state
  const [rawText, setRawText] = useState('');

  // Batch selection state
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [isBatchPickerOpen, setIsBatchPickerOpen] = useState(false);

  // Preview Response
  const [previewResponse, setPreviewResponse] = useState<any>(null);

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'delete' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Animated values for Main Sheet
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollOffsetRef = useRef(0);

  // Animated values for Batch Picker Sheet
  const slideAnimBatch = useRef(new Animated.Value(height)).current;
  const fadeAnimBatch = useRef(new Animated.Value(0)).current;

  const isBatchPickerOpenRef = useRef(isBatchPickerOpen);
  useEffect(() => {
    isBatchPickerOpenRef.current = isBatchPickerOpen;
  }, [isBatchPickerOpen]);

  // Main Sheet PanResponder gesture for drag-to-close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isBatchPickerOpenRef.current) return false;
        return (
          gestureState.dy > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          scrollOffsetRef.current <= 0
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          const opacity = Math.max(0, 1 - gestureState.dy / (height * 0.5));
          fadeAnim.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.3) {
          closeModal();
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

  // Batch Picker PanResponder gesture for drag-to-close
  const panResponderBatch = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnimBatch.setValue(gestureState.dy);
          const opacity = Math.max(0, 1 - gestureState.dy / (height * 0.5));
          fadeAnimBatch.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.3) {
          closeBatchPicker();
        } else {
          Animated.parallel([
            Animated.spring(slideAnimBatch, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 6,
            }),
            Animated.timing(fadeAnimBatch, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Smooth Open/Close Animation for Main Sheet
  useEffect(() => {
    if (visible) {
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
    } else if (showModal) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  // Smooth Open Animation for Batch Picker Sheet
  useEffect(() => {
    if (isBatchPickerOpen) {
      slideAnimBatch.setValue(height);
      fadeAnimBatch.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnimBatch, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          mass: 0.8,
          stiffness: 110,
        }),
        Animated.timing(fadeAnimBatch, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isBatchPickerOpen]);

  const closeBatchPicker = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnimBatch, {
        toValue: height,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimBatch, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsBatchPickerOpen(false);
      callback?.();
    });
  };

  const closeModal = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      handleReset();
      onClose();
      callback?.();
    });
  };

  // Queries & Mutations
  const batchesQuery = useBatchesList();
  const filePreviewMutation = usePreviewStudentImport();
  const textPreviewMutation = usePreviewStudentImportText();
  const confirmMutation = useConfirmStudentImport();

  const batchesList = batchesQuery.data ?? [];

  // Options for Batch Picker
  const batchOptions = useMemo(() => {
    return batchesList.map((b) => b.batch_name);
  }, [batchesList]);

  const selectedBatchObj = useMemo(() => {
    return batchesList.find((b) => b.id === selectedBatchId);
  }, [batchesList, selectedBatchId]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
          'application/vnd.ms-excel', // xls
          'text/csv', // csv
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
          'text/plain', // txt
          'application/pdf', // pdf
          'image/jpeg', // jpg, jpeg
          'image/png', // png
          'image/webp', // webp
          '*/*',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          size: file.size,
          type: file.mimeType || 'application/octet-stream',
        });
      }
    } catch (err) {
      console.error('File pick error:', err);
      Alert.alert('File Pick Error', 'Unable to select file from device.');
    }
  };

  const handlePreview = async () => {
    if (importMode === 'file') {
      if (!selectedFile) return;
      try {
        const response = await filePreviewMutation.mutateAsync({
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.type,
        });

        setPreviewResponse(response);
        setStep('preview');
      } catch (err) {
        console.error('File preview error:', err);
      }
    } else {
      if (!rawText.trim()) return;
      try {
        const response = await textPreviewMutation.mutateAsync(rawText);
        setPreviewResponse(response);
        setStep('preview');
      } catch (err) {
        console.error('Text preview error:', err);
      }
    }
  };

  const handleConfirm = async () => {
    if (!selectedBatchId) {
      Alert.alert('Select Batch', 'Please select a batch for the imported students.');
      return;
    }

    const studentsToImport =
      previewResponse?.students ||
      previewResponse?.data?.students ||
      (Array.isArray(previewResponse) ? previewResponse : []);

    if (!studentsToImport || studentsToImport.length === 0) {
      Alert.alert('No Students', 'No student records to import.');
      return;
    }

    try {
      await confirmMutation.mutateAsync({
        batch_id: selectedBatchId,
        students: studentsToImport,
      });

      const count = studentsToImport.length;
      const batchName = selectedBatchObj?.batch_name || 'batch';

      setToast({
        visible: true,
        message: `${count} student${count === 1 ? '' : 's'} added successfully to ${batchName}!`,
        type: 'success',
      });

      setStep('success');
    } catch (err) {
      console.error('Confirm import error:', err);
    }
  };

  const handleCloseOnly = () => {
    closeModal();
  };

  const handleDone = () => {
    closeModal(() => {
      onSuccess?.(selectedBatchId || undefined, selectedBatchObj?.batch_name);
    });
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedFile(null);
    setRawText('');
    setPreviewResponse(null);
    setSelectedBatchId(null);
    filePreviewMutation.reset();
    textPreviewMutation.reset();
    confirmMutation.reset();
  };

  const handleClose = () => {
    closeModal();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Extract student rows from preview response safely
  const previewDataObj = previewResponse?.data || previewResponse;
  const previewRows: any[] =
    previewDataObj?.students ||
    (Array.isArray(previewResponse) ? previewResponse : []);

  const totalCount =
    previewDataObj?.total_records ?? previewRows.length ?? 0;
  const validCount =
    previewDataObj?.valid_records ??
    previewRows.filter((r: any) => r.status === 'valid').length ??
    totalCount;
  const warningCount =
    previewDataObj?.warning_records ??
    previewRows.filter((r: any) => r.status === 'warning').length ??
    0;
  const invalidCount =
    previewDataObj?.invalid_records ??
    previewRows.filter((r: any) => r.status === 'invalid').length ??
    0;

  const isPreviewLoading =
    filePreviewMutation.isPending || textPreviewMutation.isPending;
  const previewError =
    filePreviewMutation.error || textPreviewMutation.error;

  if (!showModal && !visible) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
      {/* Toast Notification at top of screen */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Animated Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim, backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
        />
      </Animated.View>

      {/* SILKY SMOOTH ANIMATED BOTTOM SHEET CONTAINER */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateY: slideAnim }] }}
        className={`bg-white rounded-t-[32px] p-6 flex-col justify-between shadow-2xl relative ${
          step === 'success' ? 'h-[44%]' : 'h-[88%]'
        }`}
      >
        {/* DRAG HANDLE BAR */}
        <View className="w-full items-center pb-2 pt-0">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>
        
        {/* 1. FIXED TOP HEADER BAR */}
        <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 flex-shrink-0">
          <View className="flex-row items-center gap-3">
            <View>
              <Text className="text-[20px] font-urbanist-bold text-primary tracking-tight">
                Bulk Student Import
              </Text>
              <Text className="text-[12px] font-urbanist-medium text-secondary mt-1">
                {step === 'upload' && 'Select File or Paste OCR Text'}
                {step === 'preview' && 'Review parsed data & select batch'}
                {step === 'success' && 'Import complete'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleClose}
            className="p-1"
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <X size={20} color="#8A8A8E" />
          </Pressable>
        </View>

        {/* 2. SCROLLABLE MIDDLE BODY CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={true}
          className="flex-1 my-3"
          contentContainerStyle={{ paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          }}
        >
          {/* STEP 1: UPLOAD FILE OR PASTE TEXT */}
          {step === 'upload' && (
            <View>
              {/* Mode Selector Tabs */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#F1F5F9',
                  borderRadius: 16,
                  padding: 4,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#F2EEF4',
                }}
              >
                {/* File Upload Tab */}
                <Pressable
                  onPress={() => setImportMode('file')}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      importMode === 'file' ? '#FFFFFF' : 'transparent',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: importMode === 'file' ? 0.08 : 0,
                    shadowRadius: 3,
                    elevation: importMode === 'file' ? 2 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Urbanist-Bold',
                      color: importMode === 'file' ? '#0E0E0E' : '#6B7280',
                    }}
                  >
                    File Upload
                  </Text>
                </Pressable>

                {/* Raw Text / OCR Tab */}
                <Pressable
                  onPress={() => setImportMode('text')}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      importMode === 'text' ? '#FFFFFF' : 'transparent',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: importMode === 'text' ? 0.08 : 0,
                    shadowRadius: 3,
                    elevation: importMode === 'text' ? 2 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Urbanist-Bold',
                      color: importMode === 'text' ? '#0E0E0E' : '#6B7280',
                    }}
                  >
                    Raw Text / OCR
                  </Text>
                </Pressable>
              </View>

              {importMode === 'file' ? (
                <>
                  {/* Dropzone Box */}
                  <Pressable
                    onPress={handlePickDocument}
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                    className="border-2 border-dashed border-primary/30 rounded-[24px] bg-gray-50/60 p-6 items-center justify-center my-2"
                  >
                    <View className="p-3 border border-primary-border bg-white mb-4 rounded-xl">
                      <CloudDownload size={28} color="#4186F7" />
                    </View>
                    <Text className="text-[16px] font-urbanist-bold text-primary text-center">
                      Select Document or Image
                    </Text>
                    <Text className="text-[12px] font-urbanist-medium text-secondary text-center mt-1">
                      Supports Excel, CSV, Word, PDF, Text & Images (OCR)
                    </Text>

                    {/* Supported Format Badges */}
                    <View className="flex-row items-center gap-1.5 mt-3 flex-wrap justify-center">
                      {['XLSX', 'CSV', 'DOCX', 'TXT', 'PDF', 'JPG', 'PNG', 'WEBP'].map((ext) => (
                        <View
                          key={ext}
                          className="px-2 py-0.5 bg-white rounded-md border border-gray-200"
                        >
                          <Text className="text-[10px] font-urbanist-bold text-primary">
                            .{ext}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Pressable>

                  {/* Selected File Card */}
                  {selectedFile && (
                    <View
                      style={styles.BoxStyle}
                      className="mt-3 p-4 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-3 flex-1 mr-2">
                        <View style={styles.IconStyle} className="p-2.5">
                          <DocumentText size={22} color="#4186F7" variant="Bold" />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-[14px] font-urbanist-semibold text-primary"
                            numberOfLines={1}
                          >
                            {selectedFile.name}
                          </Text>
                          <Text className="text-[12px] font-urbanist-medium text-secondary mt-0.5">
                            {formatFileSize(selectedFile.size)}
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        onPress={() => setSelectedFile(null)}
                        className="p-1"
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      >
                        <X size={18} color="#ED4337" />
                      </Pressable>
                    </View>
                  )}
                </>
              ) : (
                <View className="mt-2">
                  <Text className="text-[14px] font-urbanist-semibold text-primary mb-2">
                    Paste Student Data Text (OCR Input)
                  </Text>
                  <TextInput
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    value={rawText}
                    onChangeText={setRawText}
                    placeholder={`Name: John Doe\nDOB: 2015-05-15\nGender: Male\nParent Name: Robert Doe\nPhone: 9876543210\nMonthly Fee: 1500`}
                    placeholderTextColor="#A0A0A0"
                    style={{ minHeight: 160 }}
                    className="p-4 bg-gray-50 border border-primary-border rounded-[20px] text-[14px] font-urbanist-medium text-primary"
                  />
                  <Text className="text-[12px] font-urbanist-medium text-secondary mt-1.5">
                    Tip: Separate fields with colons (Name: ..., Phone: ..., DOB: ...).
                  </Text>
                </View>
              )}

              {/* API Error notice */}
              {previewError && (
                <View className="mt-4 p-4 bg-red-50 rounded-[16px] border border-red-200 flex-row items-start gap-3">
                  <Danger size={20} color="#ED4337" variant="Bold" />
                  <Text className="text-[13px] font-urbanist-medium text-red-600 flex-1">
                    {getErrorMessage(previewError)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* STEP 2: PREVIEW DATA & SELECT BATCH */}
          {step === 'preview' && (
            <View>
              {/* Summary Stats Row (AttendanceSummarySheet DrawerStatCard Style) */}
              <View className="flex-row gap-3 mb-5">
                <DrawerStatCard
                  title="TOTAL"
                  value={totalCount}
                  backgroundColor="#DCF2FF"
                  borderColor="#C6EAFF"
                  titleColor="#5A6E85"
                  valueColor="#1E1E2D"
                />
                <DrawerStatCard
                  title="VALID"
                  value={validCount}
                  backgroundColor="#EBF8EF"
                  borderColor="#D4EBDB"
                  titleColor="#5A6E85"
                  valueColor="#167D44"
                />
                {warningCount > 0 && (
                  <DrawerStatCard
                    title="WARNINGS"
                    value={warningCount}
                    backgroundColor="#FEF3C7"
                    borderColor="#FDE68A"
                    titleColor="#5A6E85"
                    valueColor="#D97706"
                  />
                )}
                {invalidCount > 0 && (
                  <DrawerStatCard
                    title="INVALID"
                    value={invalidCount}
                    backgroundColor="#FDE8E8"
                    borderColor="#F9D0D0"
                    titleColor="#5A6E85"
                    valueColor="#E54848"
                  />
                )}
              </View>

              {/* BATCH SELECTION DROPDOWN */}
              <View className="mb-4">
                <Text className="text-[14px] font-urbanist-bold text-primary mb-2.5">
                  Select Target Batch <Text className="text-red-500">*</Text>
                </Text>
                <Pressable
                  onPress={() => setIsBatchPickerOpen(true)}
                  style={({ pressed }) => [styles.BoxStyle, { opacity: pressed ? 0.85 : 1 }]}
                  className="p-4 flex-row items-center justify-between border border-primary-border rounded-full bg-white"
                >
                  <View className="flex-row items-center gap-2.5 flex-1">
                    <Teacher size={20} color="#4186F7" variant="Bold" />
                    <Text
                      className={`text-[15px] font-urbanist-semibold ${
                        selectedBatchObj ? 'text-primary' : 'text-secondary'
                      }`}
                    >
                      {selectedBatchObj ? selectedBatchObj.batch_name : 'Choose a Batch for Students'}
                    </Text>
                  </View>
                  <ArrowDown2 size={18} color="#626262" variant="Linear" />
                </Pressable>
              </View>

              {/* Student Rows Preview List */}
              <Text className="text-[15px] font-urbanist-bold text-primary mb-2">
                Extracted Students ({previewRows.length})
              </Text>

              {previewRows.length > 0 ? (
                <View className="gap-2.5">
                  {previewRows.map((row: any, idx: number) => {
                    const name =
                      row.full_name ||
                      row.name ||
                      row.student_name ||
                      `Student ${idx + 1}`;
                    const phone = row.phone_number || row.phone || 'No phone';
                    const fee = row.monthly_fee ? `₹${row.monthly_fee}` : null;
                    const statusStr = (row.status || 'valid').toLowerCase();

                    const isInvalid = statusStr === 'invalid';
                    const isWarning = statusStr === 'warning';

                    const rowErrors: string[] = row.errors || [];
                    const rowWarnings: string[] = row.warnings || [];

                    return (
                      <View
                        key={idx}
                        className={`p-5 rounded-[28px] bg-white border border-primary-border ${
                          isInvalid
                            ? 'border-red-300 bg-red-50/30'
                            : isWarning
                            ? 'border-amber-300 bg-amber-50/30'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2.5 flex-1">
                            <View className="flex-1">
                              <Text
                                className="text-[15px] font-urbanist-semibold text-primary mb-1"
                                numberOfLines={1}
                              >
                                {name}
                              </Text>
                              <Text className="text-[12px] font-urbanist-medium text-secondary">
                                Phone: {phone} {fee ? `• Fee: ${fee}` : ''}
                              </Text>
                            </View>
                          </View>

                          {isInvalid ? (
                            <View className="px-2.5 py-1 bg-red-100 rounded-md">
                              <Text className="text-[11px] font-urbanist-semibold text-red-600">
                                Invalid
                              </Text>
                            </View>
                          ) : isWarning ? (
                            <View className="px-2.5 py-1 bg-amber-100 rounded-md">
                              <Text className="text-[11px] font-urbanist-semibold text-amber-700">
                                Warning
                              </Text>
                            </View>
                          ) : (
                            <View className="px-2.5 py-1 bg-green-100 rounded-md">
                              <Text className="text-[11px] font-urbanist-semibold text-green-700">
                                Valid
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Error / Warning detail chips */}
                        {(rowErrors.length > 0 || rowWarnings.length > 0) && (
                          <View className="mt-2 pt-2 border-t border-gray-100/80 gap-1">
                            {rowErrors.map((err, eIdx) => (
                              <View key={eIdx} className="flex-row items-center gap-1.5">
                                <Danger size={12} color="#ED4337" variant="Bold" />
                                <Text className="text-[11px] font-urbanist-medium text-red-600">
                                  {err}
                                </Text>
                              </View>
                            ))}
                            {rowWarnings.map((warn, wIdx) => (
                              <View key={wIdx} className="flex-row items-center gap-1.5">
                                <Warning2 size={12} color="#D97706" variant="Bold" />
                                <Text className="text-[11px] font-urbanist-medium text-amber-700">
                                  {warn}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.BoxStyle} className="p-6 items-center justify-center">
                  <Text className="text-[14px] font-urbanist-medium text-secondary text-center">
                    Data parsed successfully. Choose a batch and click confirm below.
                  </Text>
                </View>
              )}

              {/* Confirm Error Notice */}
              {confirmMutation.isError && (
                <View className="mt-4 p-4 bg-red-50 rounded-[16px] border border-red-200 flex-row items-start gap-3">
                  <Danger size={20} color="#ED4337" variant="Bold" />
                  <Text className="text-[13px] font-urbanist-medium text-red-600 flex-1">
                    {getErrorMessage(confirmMutation.error)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 'success' && (
            <View className="py-6 items-center justify-center">
              <View className="p-4 bg-green-100 rounded-full mb-4">
                <TickCircle size={56} color="#02763D" variant="Bold" />
              </View>

              <Text className="text-[22px] font-urbanist-bold text-primary tracking-tight text-center">
                Students Imported!
              </Text>
              <Text className="text-[14px] font-urbanist-medium text-secondary text-center mt-2 px-4">
                Students have been created and added to{' '}
                <Text className="font-urbanist-bold text-primary">
                  {selectedBatchObj?.batch_name || 'the batch'}
                </Text>.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* 3. FIXED BOTTOM FOOTER / ACTION BUTTONS */}
        <View className="pt-3 border-t border-gray-100 bg-white flex-shrink-0">
          {step === 'upload' && (
            <PrimaryBtn
              label={isPreviewLoading ? 'Extracting & Parsing Data...' : 'Preview Parsed Data'}
              bgColor="#000000"
              textColor="#fff"
              loading={isPreviewLoading}
              disabled={
                (importMode === 'file' ? !selectedFile : !rawText.trim()) ||
                isPreviewLoading
              }
              className="w-full h-[48px]"
              onPress={handlePreview}
            />
          )}

          {step === 'preview' && (
            <View className="flex-row items-center gap-3.5 w-full">
              {/* Re-upload / Cancel Button (White / Outline on LEFT) */}
              <PrimaryBtn
                label="Re-upload"
                variant="outline"
                className="flex-1 h-[48px]"
                onPress={handleReset}
              />

              {/* Confirm Import Button (Black on RIGHT) */}
              <PrimaryBtn
                label={confirmMutation.isPending ? 'Creating...' : 'Confirm Import'}
                bgColor="#000000"
                textColor="#fff"
                loading={confirmMutation.isPending}
                disabled={!selectedBatchId || confirmMutation.isPending}
                className="flex-1 h-[48px]"
                onPress={handleConfirm}
              />
            </View>
          )}

          {step === 'success' && (
            <View className="flex-row items-center gap-3.5 w-full">
              {/* Done Button (White / Outline on LEFT) */}
              <PrimaryBtn
                label="Done"
                variant="outline"
                className="flex-1 h-[48px]"
                onPress={handleCloseOnly}
              />

              {/* View Students Button (Black on RIGHT) */}
              <PrimaryBtn
                label="View Students"
                bgColor="#000000"
                textColor="#fff"
                className="flex-1 h-[48px]"
                onPress={handleDone}
              />
            </View>
          )}
        </View>

        {/* SILKY SMOOTH INLINE BATCH SELECTOR SHEET WITH GESTURE & BACKDROP DISMISS */}
        {isBatchPickerOpen && (
          <View className="absolute inset-0 z-[1100] justify-end rounded-t-[32px]">
            {/* Animated Backdrop for Batch Picker */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnimBatch, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 32 }]}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => closeBatchPicker()}
              />
            </Animated.View>

            <Animated.View
              {...panResponderBatch.panHandlers}
              style={{ transform: [{ translateY: slideAnimBatch }] }}
              className="bg-white rounded-[28px] p-5 max-h-[75%] shadow-2xl relative z-10  mb-0"
            >
              {/* Drag handle */}
              <View className="w-full items-center pb-2 pt-0">
                <View className="w-12 h-1 bg-gray-300 rounded-full" />
              </View>

              <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 mb-2">
                <Text className="text-[18px] font-urbanist-bold text-primary">
                  Select Target Batch
                </Text>
                <Pressable
                  onPress={() => closeBatchPicker()}
                  className="p-1"
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <X size={24} color="#8A8A8E" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={true} className="my-2">
                {batchOptions.map((option, index) => {
                  const isSelected = selectedBatchObj?.batch_name === option;
                  return (
                    <Pressable
                      key={index}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch (e) {}
                        const match = batchesList.find(
                          (b) => b.batch_name === option
                        );
                        if (match) {
                          setSelectedBatchId(match.id);
                        }
                        closeBatchPicker();
                      }}
                    >
                      {({ pressed }) => (
                        <View
                          className={`p-3.5 rounded-[16px] mb-2 flex-row items-center justify-between ${
                            pressed
                              ? isSelected
                                ? 'bg-primary/20 border border-primary/40'
                                : 'bg-gray-200/80 border border-gray-200'
                              : isSelected
                              ? 'bg-primary/10 border border-primary/30'
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <Text
                            className={`text-[15px] font-urbanist-semibold ${
                              isSelected ? 'text-primary' : 'text-secondary'
                            }`}
                          >
                            {option}
                          </Text>
                          {isSelected && (
                            <TickCircle size={20} color="#4186F7" variant="Bold" />
                          )}
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Animated.View>
          </View>
        )}

      </Animated.View>
    </View>
  </Modal>
  );
}
