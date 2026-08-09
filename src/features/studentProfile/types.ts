import { ImageSourcePropType } from 'react-native';

export type StudentProfileTabType = 'overview' | 'attendance' | 'payments';

export interface ParentInfo {
  parentName: string;
  phone: string;
  emergency: string;
}

export interface PersonalInfo {
  gender: string;
  dob: string;
  bloodGroup: string;
  address: string;
}

export interface FeeInfo {
  monthlyFee: string;
  pending: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface AttendanceStats {
  present: number;
  absent: number;
  attendancePercent: string;
  scheduledDaysCount: number;
}

export type AttendanceDayStatus = 'present' | 'absent' | 'holiday' | 'weekend' | 'current' | 'none';

export interface AttendanceDayItem {
  dayName: string; // e.g. 'Sun', 'Mon'
  dayNumber: string; // e.g. '28', '29', '01'
  fullDate: string; // e.g. '2026-01-28'
  status: AttendanceDayStatus;
}

export interface BalanceSummary {
  lastPaidAmount: string;
  lastPaidDate: string;
  nextPaymentAmount: string;
  nextPaymentDueDate: string;
  daysLeftText?: string;
}

export type CurrentMonthStatus = 'paid' | 'pending' | 'overdue';

export interface CurrentMonthFee {
  monthYear: string; // e.g. 'AUGUST 2026'
  amount: string; // e.g. '₹1,250'
  status: CurrentMonthStatus;
  statusSubtext: string; // e.g. 'Paid on 05 Aug' | 'Due: 05 Aug 2026'
  paymentDetails: string; // e.g. 'Paid by: GPay / Cash' | 'Pending' | 'Over due'
}

export interface TransactionItem {
  id: string;
  title: string; // e.g. 'August Fee'
  dateAndMethod: string; // e.g. '12 Aug 2026 • UPI'
  amount: string; // e.g. '₹1,250'
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface StudentProfileData {
  id: string;
  name: string;
  avatar?: ImageSourcePropType | string;
  joinedDate: string; // e.g. '10 Jul 2026'
  location: string; // e.g. 'Sathya Stadium'
  attendancePercent: string; // e.g. '92%'

  // Overview Tab Data
  parentInfo: ParentInfo;
  personalInfo: PersonalInfo;
  feeInfo: FeeInfo;

  // Attendance Tab Data
  attendanceStats: AttendanceStats;
  attendanceGrid: AttendanceDayItem[];

  // Payments Tab Data
  balanceSummary: BalanceSummary;
  currentMonthFee: CurrentMonthFee;
  transactions: TransactionItem[];
}

export interface StudentProfileScreenProps {
  student?: StudentProfileData;
  studentId?: string;
  shouldRestoreTabBarOnUnmount?: boolean;
  onBackPress?: () => void;
  onDeletePress?: () => void;
  onCallPress?: (phone: string) => void;
  onCollectPress?: () => void;
  onEditPress?: () => void;
  onStudentUpdate?: (updatedStudent: StudentProfileData) => void;
}
