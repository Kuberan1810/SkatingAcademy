import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { CallCalling,  EmptyWallet, Edit } from 'iconsax-react-native';
import ActionButton, { ActionButtonProps } from '@/features/studentProfile/components/ui/ActionButton';

export { ActionButton, ActionButtonProps };

export interface StudentActionButtonsProps {
  onCallPress?: () => void;
  onCollectPress?: () => void;
  onEditPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function StudentActionButtons({
  onCallPress,
  onCollectPress,
  onEditPress,
  style,
  className = '',
}: StudentActionButtonsProps) {
  return (
    <View className={`flex-row items-center gap-3 mb-5 ${className}`} style={style}>
      {/* Call Button (Blue) */}
      <ActionButton
        label="Call"
        variant="blue"
        icon={<CallCalling size={18} color="#FFFFFF" />}
        onPress={onCallPress}
        hapticStyle="medium"
      />

      {/* Collect Button (Green) */}
      <ActionButton
        label="Collect"
        variant="green"
        icon={< EmptyWallet size={18} color="#FFFFFF" />}
        onPress={onCollectPress}
        hapticStyle="medium"
      />

      {/* Edit Button (White Outline) */}
      <ActionButton
        label="Edit"
        variant="outline"
        icon={<Edit size={18} color="#374151" variant="Linear" />}
        onPress={onEditPress}
        hapticStyle="light"
      />
    </View>
  );
}
