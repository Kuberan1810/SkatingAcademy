import { styles } from '@/styles/styles';
import { Moneys, ClipboardText, UserAdd, Element3 } from 'iconsax-react-native';
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Notification } from './types';

interface NotificationCardProps {
    notification: Notification;
    onPress?: (id: string) => void;
}

const getIconForType = (type: string) => {
    switch (type) {
        case 'fees':
            return <Moneys size={24} color="#F67300" variant="Bold" />;
        case 'attendance':
            return <ClipboardText size={24} color="#3B82F6" variant="Bold" />; // Blue
        case 'student':
            return <UserAdd size={24} color="#10B981" variant="Bold" />; // Green
        case 'system':
            return <Element3 size={24} color="#8B5CF6" variant="Bold" />; // Purple
        default:
            return <Element3 size={24} color="#626262" variant="Bold" />;
    }
};

const getIconBgColor = (type: string) => {
    switch (type) {
        case 'fees':
            return 'bg-[#FFF5ED]'; // Orange light
        case 'attendance':
            return 'bg-[#EFF6FF]'; // Blue light
        case 'student':
            return 'bg-[#ECFDF5]'; // Green light
        case 'system':
            return 'bg-[#F5F3FF]'; // Purple light
        default:
            return 'bg-[#F3F4F6]'; // Gray light
    }
};

export default function NotificationCard({ notification, onPress }: NotificationCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPress?.(notification.id)}
            style={[styles.BoxStyle2, { marginBottom: 12 }]}
            className="flex-row items-start"
        >
            {/* Icon Container */}
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${getIconBgColor(notification.type)}`}>
                {getIconForType(notification.type)}
            </View>

            {/* Content */}
            <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center flex-1 pr-2">
                        <Text className="text-[16px] font-urbanist-semibold text-[#333333] mr-2">
                            {notification.title}
                        </Text>
                        {notification.isUnread && (
                            <View className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                        )}
                    </View>
                </View>

                <View className='flex-1 flex-row justify-between' >
                    <Text className="text-[13px] font-urbanist-medium text-[#808080] mb-2 leading-5 max-w-[220px]">
                        {notification.description}
                    </Text>

                    <Text className="text-[11px] font-urbanist-medium text-[#999999] capitalize tracking-wider">
                        {notification.timeAgo}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
