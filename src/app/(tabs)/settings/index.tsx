import Header from '@/components/ui/Header';
import SettingsScreenCard, { MenuItemData, UserProfileData } from '@/features/settings/SettingsScreenCard';
import { router, useRouter } from 'expo-router';
import { InfoCircle, Logout, MessageQuestion, NotificationBing, Setting2, User } from 'iconsax-react-native';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '@/components/screen-wrapper';
import { useAuth } from '@/hooks/use-auth';

export default function SettingsScreen() {
    const routerHook = useRouter();
    const insets = useSafeAreaInsets();
    const { user: authUser, logoutAsync, isLoggingOut } = useAuth();

    const user: UserProfileData = {
        name: authUser?.name || '',
        email: authUser?.email || '',
        image: authUser?.avatar || '',
    };

    const menuItems: MenuItemData[] = [
        {
            id: 1,
            label: 'My Profile',
            icon: <User size={24} color="#4B5563" variant="Linear" />,
            onPress: () => router.push('/(tabs)/settings/profile' as any),
        },
        {
            id: 2,
            label: 'Notifications',
            icon: <NotificationBing size={24} color="#4B5563" variant="Linear" />,
            // badgeCount: 2,
            onPress: () => router.push('/(tabs)/notifications'),
        },
        {
            id: 3,
            label: 'App Settings',
            icon: <Setting2 size={24} color="#4B5563" variant="Linear" />,
            onPress: () => router.push('/(tabs)/settings/app-settings' as any),
        },
        {
            id: 4,
            label: 'Help & FAQ',
            icon: <MessageQuestion size={24} color="#4B5563" variant="Linear" />,
            onPress: () => router.push('/(tabs)/settings/help-faq' as any),
        },
        {
            id: 5,
            label: 'About App',
            icon: <InfoCircle size={24} color="#4B5563" variant="Linear" />,
            onPress: () => router.push('/(tabs)/settings/about' as any),
        },
        {
            id: 6,
            label: 'Logout',
            icon: <Logout size={24} color="#EF4444" variant="Linear" />,
            isLogout: true,
        },
    ];

    const handleLogoutConfirm = async () => {
        try {
            await logoutAsync();
        } catch {
            // Fallback redirect if network offline
            router.replace('/(auth)/login' as any);
        }
    };

    return (
        <ScreenWrapper className="bg-white">
            <Header
                variant="page"
                title="Settings"
                onBackPress={() => {
                    if (routerHook.canGoBack()) {
                        routerHook.back();
                    } else {
                        router.replace('/(tabs)/dashboard' as any);
                    }
                }}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <SettingsScreenCard
                    user={user}
                    menuItems={menuItems}
                    onLogoutConfirm={handleLogoutConfirm}
                    isLoggingOut={isLoggingOut}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}
