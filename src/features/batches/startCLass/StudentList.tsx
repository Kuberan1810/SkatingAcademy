import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import StudentAttendanceCard, { StudentData, AttendanceStatus } from './StudentAttendanceCard';

export interface StudentListProps {
  title?: string;
  students: StudentData[];
  attendanceMap: Record<string, AttendanceStatus>;
  onAttendanceChange: (id: string, status: AttendanceStatus) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function StudentList({
  title = 'Student List',
  students,
  attendanceMap,
  onAttendanceChange,
  style,
  className = '',
}: StudentListProps) {
  return (
    <View style={style} className={`px-5 py-2 w-full ${className}`}>
      {/* Section Title */}
      <Text className="text-[24px] font-urbanist-bold text-primary mb-5">
        {title}
      </Text>

      {/* List of Student Cards */}
      <View className="gap-3">
        {students.map((student) => (
          <StudentAttendanceCard
            key={student.id}
            student={student}
            status={attendanceMap[student.id] || 'none'}
            onStatusChange={onAttendanceChange}
          />
        ))}
      </View>
    </View>
  );
}
