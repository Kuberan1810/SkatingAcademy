import styles from '@/styles/styles';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft2, NotificationBing } from 'iconsax-react-native';
import React from 'react';
import { ImageSourcePropType, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import SkeletonComponent from '@/components/ui/Skeleton';

export type IconPropType =
    | React.ReactNode
    | React.ComponentType<{ size?: number; color?: string; variant?: string }>
    | any;

export interface HeaderProps {
    /** Mode variant: 'profile' for Home/Dashboard (Avatar + Greeting), 'page' for SubHeader (Back + Title + Action) */
    variant?: 'profile' | 'page';

    // Profile Header Props
    userName?: string;
    greeting?: string;
    avatarSource?: ImageSourcePropType | string;
    onAvatarPress?: () => void;
    isLoading?: boolean;

    // Page Header Props
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    leftIcon?: IconPropType;
    onBackPress?: () => void;

    // Right Action Icon Props (pass component like rightIcon={Setting2} or element like rightIcon={<Setting2 size={24} />})
    rightIcon?: IconPropType;
    onRightPress?: () => void;
    secondaryRightIcon?: IconPropType;
    onSecondaryRightPress?: () => void;
    onNotificationPress?: () => void;
    hasUnreadNotifications?: boolean;
    notificationCount?: number;

    style?: StyleProp<ViewStyle>;
    className?: string;
}

const DEFAULT_AVATAR = require('../../../assets/images/home/dp.svg');

/**
 * Renders icons:
 * - If component passed (e.g. rightIcon={Setting2}), renders <RightIcon size={20} color="#626262" variant="Linear" />
 * - If element passed (e.g. rightIcon={<Setting2 />}), renders element directly
 */
function renderHeaderIcon(icon: IconPropType): React.ReactNode {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
        return icon;
    }
    const IconComponent = icon as React.ComponentType<any>;
    return <IconComponent size={20} color="#626262" variant="Linear" />;
}

/**
 * Reusable Figma-styled Icon Button using NativeWind classes.
 * 44x44 size, 18px corner radius, #F2EEF4 border, and inset (inner) shadow.
 */
export function FigmaIconButton({
    children,
    onPress,
    style,
    className = '',
}: {
    children: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    className?: string;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[styles.BlackInnerShadowStyle]}
            className={`p-[13px] rounded-[18px] bg-white border border-primary-border justify-center items-center shadow-[inset_4px_4px_4px_rgba(0,0,0,0.05),_inset_-4px_-4px_4px_rgba(0,0,0,0.05)] ${className}`}
        >
            <View className="items-center justify-center">
                {children}
            </View>
        </TouchableOpacity>
    );
}

export default function Header({
    variant = 'profile',
    userName,
    greeting = 'Welcome',
    avatarSource = DEFAULT_AVATAR,
    isLoading,
    title,
    subtitle,
    showBack = true,
    leftIcon = ArrowLeft2,
    onBackPress,
    rightIcon,
    onRightPress,
    secondaryRightIcon,
    onSecondaryRightPress,
    onNotificationPress,
    onAvatarPress,
    hasUnreadNotifications = false,
    notificationCount,
    style,
    className = '',
}: HeaderProps) {
    const isPageHeader = variant === 'page' || !!title;

    const resolvedAvatar = React.useMemo(() => {
        if (!avatarSource) return DEFAULT_AVATAR;
        if (typeof avatarSource === 'string') {
            return { uri: avatarSource };
        }
        if (typeof avatarSource === 'object' && avatarSource !== null && 'default' in avatarSource) {
            return (avatarSource as any).default;
        }
        return avatarSource;
    }, [avatarSource]);

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            try {
                if (router.canGoBack()) {
                    router.back();
                }
            } catch (e) {
                console.log('Navigation back error:', e);
            }
        }
    };

    // Render Page Header (Back / Left Icon + Title + Optional Right Icons)
    if (isPageHeader) {
        return (
            <View style={style} className={`flex-row items-center justify-between px-5 py-3.5 w-full ${className}`}>
                {/* Left: Back / Custom Left Icon */}
                {showBack ? (
                    <FigmaIconButton onPress={handleBack}>
                        {renderHeaderIcon(leftIcon)}
                    </FigmaIconButton>
                ) : (
                    <View className="w-[44px] h-[44px]" />
                )}

                {/* Center: Title & Optional Subtitle */}
                <View className="flex-1 mx-2 items-center justify-center">
                    {isLoading ? (
                        <View className="items-center gap-1.5">
                            <SkeletonComponent width={120} height={20} borderRadius={6} />
                            {subtitle && <SkeletonComponent width={80} height={14} borderRadius={4} />}
                        </View>
                    ) : (
                        <>
                            <Text className="text-[20px] font-urbanist-bold text-primary text-center" numberOfLines={1}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text className="text-[16px] font-urbanist-medium text-secondary text-center mt-1" numberOfLines={1}>
                                    {subtitle}
                                </Text>
                            )}
                        </>
                    )}
                </View>

                {/* Right: Custom Right Icon(s) */}
                <View className="flex-row items-center gap-2">
                    {secondaryRightIcon && (
                        <FigmaIconButton onPress={onSecondaryRightPress}>
                            {renderHeaderIcon(secondaryRightIcon)}
                        </FigmaIconButton>
                    )}
                    {rightIcon ? (
                        <FigmaIconButton onPress={onRightPress || onNotificationPress}>
                            {renderHeaderIcon(rightIcon)}
                        </FigmaIconButton>
                    ) : (
                        !secondaryRightIcon && <View className="w-[44px] h-[44px]" />
                    )}
                </View>
            </View>
        );
    }

    // Determine if profile header is in loading state
    const isProfileLoading = isLoading ?? (!userName && isLoading !== false);

    // Render Profile Header (Avatar + Greetings + Notification / Right Icon)
    return (
        <View style={style} className={`flex-row items-center justify-between px-5 py-3.5 w-full ${className}`}>
            {/* Left section: Avatar & Greetings */}
            <View className="flex-row items-center flex-1 mr-3">
                {isProfileLoading ? (
                    <SkeletonComponent
                        width={48}
                        height={48}
                        borderRadius={24}
                    />
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onAvatarPress}
                        disabled={!onAvatarPress}
                        style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden' }}
                        className="w-[48px] h-[48px] rounded-full overflow-hidden bg-gray-200 justify-center items-center"
                    >
                        <Image
                            source={resolvedAvatar}
                            style={{ width: 48, height: 48, borderRadius: 24 }}
                            className="w-[48px] h-[48px] rounded-full"
                            contentFit="cover"
                            transition={200}
                        />
                    </TouchableOpacity>
                )}

                <View className="ml-3.5 justify-center flex-1">
                    {isProfileLoading ? (
                        <View className="gap-1.5">
                            <SkeletonComponent width={55} height={12} borderRadius={6} />
                            <SkeletonComponent width={120} height={16} borderRadius={6} />
                        </View>
                    ) : (
                        <>
                            <Text className="text-[15px] font-urbanist-medium text-light -tracking-[0.2px] mb-0.5">
                                {greeting}
                            </Text>
                            <Text className="text-[17px] font-urbanist-semibold text-primary -tracking-[0.5px]" numberOfLines={1}>
                                {userName || ''}
                            </Text>
                        </>
                    )}
                </View>
            </View>

            {/* Right section: Notification or Custom Right Icon */}
            <FigmaIconButton onPress={onNotificationPress || onRightPress}>
                {renderHeaderIcon(rightIcon || NotificationBing)}
                {notificationCount !== undefined && notificationCount > 0 ? (
                    <View className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-[#EF4444] items-center justify-center px-1 z-10 border-2 border-white">
                        <Text className="text-white text-[10px] font-urbanist-bold">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </Text>
                    </View>
                ) : hasUnreadNotifications ? (
                    <View className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#EF4444] z-10 border-2 border-white" />
                ) : null}
            </FigmaIconButton>
        </View>
    );
}