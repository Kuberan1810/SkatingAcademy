export interface StudentFormData {
  // Step 1: Basic Info
  avatarUri?: string | null;
  fullName: string;
  age: string;
  gender: string;
  dob: string;
  bloodGroup: string;

  // Step 2: Batch Info
  batch: string;
  joinDate: string;

  // Step 3: Parent & Payment Info
  parentName: string;
  phoneNumber: string;
  emergencyContact: string;
  monthlyFee: string;
}

export interface AddStudentScreenProps {
  initialValues?: Partial<StudentFormData>;
  onBackPress?: () => void;
  onSubmit?: (data: StudentFormData) => void;
  onReset?: () => void;
  onPickAvatar?: () => void;
  availableBatches?: string[];
}
