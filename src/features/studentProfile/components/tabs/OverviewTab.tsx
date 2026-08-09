import React from 'react';
import { View } from 'react-native';
import InfoCard from '../ui/InfoCard';
import { ParentInfo, PersonalInfo, FeeInfo } from '../../types';

export interface OverviewTabProps {
  parentInfo: ParentInfo;
  personalInfo: PersonalInfo;
  feeInfo: FeeInfo;
}

export default function OverviewTab({
  parentInfo,
  personalInfo,
  feeInfo,
}: OverviewTabProps) {
  const parentItems = [
    { label: 'Parent Name', value: parentInfo.parentName },
    { label: 'Phone', value: parentInfo.phone },
    { label: 'Emergency', value: parentInfo.emergency },
  ];

  const personalItems = [
    { label: 'Gender', value: personalInfo.gender },
    { label: 'DOB', value: personalInfo.dob },
    { label: 'Blood Group', value: personalInfo.bloodGroup },
    { label: 'Address', value: personalInfo.address },
  ];

  const feeStatusColor =
    feeInfo.status === 'PAID'
      ? '#02763D'
      : feeInfo.status === 'PENDING'
      ? '#EA580C'
      : '#DC2626';

  const feeItems = [
    { label: 'Monthly Fee', value: feeInfo.monthlyFee },
    { label: 'Pending', value: feeInfo.pending },
    {
      label: 'Status',
      value: feeInfo.status,
      valueColor: feeStatusColor,
      isBoldValue: true,
    },
  ];

  return (
    <View className="w-full">
      {/* Parent Information Card */}
      <InfoCard title="Parent Information" items={parentItems} />

      {/* Personal Card */}
      <InfoCard title="Personal" items={personalItems} />

      {/* Fee Card */}
      <InfoCard title="Fee" items={feeItems} />
    </View>
  );
}
