import React from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { ArrowLeft2 } from 'iconsax-react-native';
import { router } from 'expo-router';
import styles from '@/styles/styles';

export type IconPropType =
    | React.ReactNode
    | React.ComponentType<{ size?: number; color?: string; variant?: string }>
    | any;

export interface GoBackProps {
    /** Custom back press handler. If not provided, defaults to `router.back()` if navigation stack can go back */
    onPress?: () => void;
    /** Custom icon node or component. Defaults to `ArrowLeft2` */
    icon?: IconPropType;
    /** Size of icon. Defaults to 20 */
    iconSize?: number;
    /** Color of icon. Defaults to "#626262" */
    iconColor?: string;
    /** Optional custom View style */
    style?: StyleProp<ViewStyle>;
    /** Optional NativeWind/Tailwind class name */
    className?: string;
}

/**
 * Reusable Figma-styled GoBack button component using NativeWind classes.
 * 44x44 size, 18px corner radius, #F2EEF4 border, and inset (inner) shadow.
 */
export default function GoBack({
    onPress,
    icon: CustomIcon = ArrowLeft2,
    iconSize = 20,
    iconColor = '#626262',
    style,
    className = '',
}: GoBackProps) {
    const handlePress = () => {
        if (onPress) {
            onPress();
        } else if (router.canGoBack()) {
            router.back();
        }
    };

    const renderIcon = () => {
        if (!CustomIcon) return null;
        if (React.isValidElement(CustomIcon)) {
            return CustomIcon;
        }
        const IconComponent = CustomIcon as React.ComponentType<any>;
        return <IconComponent size={iconSize} color={iconColor} variant="Linear" />;
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            style={[styles.BlackInnerShadowStyle, style]}
            className={`w-[44px] h-[44px] self-start rounded-[18px] bg-white border border-primary-border justify-center items-center ${className}`}
        >
            <View className="items-center justify-center">
                {renderIcon()}
            </View>
        </TouchableOpacity>
    );
}
