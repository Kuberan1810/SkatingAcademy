export interface BatchFormData {
  // Step 1: Batch Information
  batchName: string;
  level?: string;
  location: string;
  description: string;

  // Step 2: Schedule & Fees
  classType: string;
  trainingDays: string;
  startTime: string;
  endTime: string;
  monthlyFee: string;
  yearlyFee: string;
}

export interface CreateBatchScreenProps {
  batchId?: number | string;
  initialValues?: Partial<BatchFormData>;
  mode?: 'create' | 'edit';
  headerTitle?: string;
  submitButtonText?: string;
  onBackPress?: () => void;
  onSubmit?: (data: BatchFormData) => void;
  onReset?: () => void;
  availableLevels?: string[];
  availableClassTypes?: string[];
}
