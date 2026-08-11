import * as Haptics from 'expo-haptics';
import { ArrowRight2 } from 'iconsax-react-native';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import LogoutConfirmationModal from '@/components/ui/LogoutConfirmationModal';
import styles from '@/styles/styles';

export interface UserProfileData {
    name: string;
    email: string;
    image?: string;
}

export interface MenuItemData {
    id: string | number;
    label: string;
    icon: React.ReactNode;
    onPress?: () => void;
    badgeCount?: number;
    isLogout?: boolean;
}

interface SettingsScreenCardProps {
    user: UserProfileData;
    menuItems: MenuItemData[];
    onLogoutConfirm?: () => void;
}

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    badgeCount?: number;
    isLogout?: boolean;
}

const DEAFULT_IMAGE = require('@/assets/images/home/dp.svg');

const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    label,
    onPress,
    badgeCount,
    isLogout = false,
}) => {
    const handlePress = () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) { }
        onPress?.();
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            className="flex-row items-center py-7"
        >
            <View className="w-10 items-center justify-center mr-3">
                {icon}
            </View>

            <Text
                className={`flex-1 text-[18px] ${isLogout
                    ? 'text-red-500 font-urbanist-medium'
                    : 'text-[#333333] font-urbanist-semibold'
                    }`}
            >
                {label}
            </Text>

            {!isLogout &&
                (badgeCount !== undefined ? (
                    <View className="w-6 h-6 rounded-full bg-[#F67300] items-center justify-center">
                        <Text className="text-white text-[11px] font-urbanist-bold">
                            {badgeCount}
                        </Text>
                    </View>
                ) : (
                    <ArrowRight2
                        size={18}
                        color="#9CA3AF"
                        variant="Linear"
                    />
                ))}
        </TouchableOpacity>
    );
};

const getInitials = (name: string) => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
        return words[0].substring(0, 2).toUpperCase();
    } else if (words.length === 1) {
        return words[0].toUpperCase();
    }
    return '';
};

export default function SettingsScreenCard({ user, menuItems, onLogoutConfirm }: SettingsScreenCardProps) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <View className="flex-1 bg-white px-5 pt-6">
            {/* User Info */}
            <View className="flex-row items-center mb-8">
                {user.image ? (
                    <Image

                        source={{ uri: user.image }}
                        className="w-[88px] h-[88px] rounded-full mr-4 bg-gray-200"
                    />
                ) : (
                    <View
                        style={[styles.BlackInnerShadowStyle]}
                        className="w-[88px] h-[88px] rounded-full mr-4 bg-[#FFF5ED] items-center justify-center border border-primary-border">
                        <Text className="text-[#F67300] font-urbanist-bold text-[32px]">
                            {getInitials(user.name)}
                        </Text>
                    </View>
                )}

                <View>
                    <Text className="text-[24px] font-urbanist-semibold text-[#333] mb-1">
                        {user.name}
                    </Text>

                    <Text className="text-[14px] font-urbanist-medium text-[#808080]">
                        {user.email}
                    </Text>
                </View>
            </View>

            {/* Menu */}
            <View className="flex-1">
                {menuItems.map((item) => (
                    <MenuItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        badgeCount={item.badgeCount}
                        isLogout={item.isLogout}
                        onPress={item.isLogout ? () => setShowLogoutModal(true) : item.onPress}
                    />
                ))}
            </View>

            <LogoutConfirmationModal
                visible={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={onLogoutConfirm}
            />
        </View>
    );
}
