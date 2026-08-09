import React from 'react';
import { Trash } from 'iconsax-react-native';
import Header, { HeaderProps } from '@/components/ui/Header';

export interface StudentProfileHeaderProps extends Partial<HeaderProps> {
  onDeletePress?: () => void;
}

export default function StudentProfileHeader({
  title = 'Student Profile',
  onBackPress,
  onDeletePress,
  ...rest
}: StudentProfileHeaderProps) {
  return (
    <Header
      variant="page"
      title={title}
      showBack={true}
      onBackPress={onBackPress}
      rightIcon={<Trash size={20} color="#EF4444" variant="Linear" />}
      onRightPress={onDeletePress}
      {...rest}
    />
  );
}
