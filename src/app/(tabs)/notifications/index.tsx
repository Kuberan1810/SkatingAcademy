import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import NotificationCard from '@/features/notifications/NotificationCard';
import NotificationsFilter from '@/features/notifications/NotificationsFilter';
import { Notification, NotificationFilter as FilterType } from '@/features/notifications/types';
import styles from '@/styles/styles';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { NotificationBing } from 'iconsax-react-native';
import React, { useState, useEffect } from 'react';
import { BackHandler, SectionList, Text, View } from 'react-native';

const MOCK_NOTIFICATIONS: Notification[] = [
    /*
    {
        id: '1',
        type: 'fees',
        title: '3 fee payments overdue',
        description: '₹10,000 pending from Ananya, Rohan and Devansh',
        timeAgo: '12M Ago',
        isUnread: false,
    },
    {
        id: '2',
        type: 'attendance',
        title: 'Attendance not marked',
        description: 'Weekend Kids • 09:00 AM session',
        timeAgo: '1H Ago',
        isUnread: true,
    },
    {
        id: '3',
        type: 'student',
        title: 'New student joined',
        description: 'Sara Khan enrolled in Weekend Kids',
        timeAgo: '3H Ago',
        isUnread: true,
    },
    {
        id: '4',
        type: 'fees',
        title: '₹1,500 payment received',
        description: 'Meera Kapoor • UPI',
        timeAgo: '5H Ago',
        isUnread: false,
    },
    {
        id: '6',
        type: 'attendance',
        title: 'Low attendance alert',
        description: 'Rohan Malhotra dropped to 61% this month',
        timeAgo: 'Yesterday',
        isUnread: false,
    },
    */
];

const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.isUnread).length;

const FILTERS: FilterType[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', ...(unreadCount > 0 ? { count: unreadCount } : {}) },
    { id: 'fees', label: 'Fees' },
    { id: 'attendance', label: 'Attendance' },
];

export default function NotificationsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const { hideTabBar, showTabBar } = useTabBarVisibility();

    useEffect(() => {
        hideTabBar();
        return () => {
            showTabBar();
        };
    }, []);

    const filteredNotifications = MOCK_NOTIFICATIONS.filter((notif) => {
        const matchesFilter =
            activeFilter === 'all'
                ? true
                : activeFilter === 'unread'
                ? notif.isUnread
                : notif.type === activeFilter;

        const matchesSearch = searchQuery.trim()
            ? notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              notif.description.toLowerCase().includes(searchQuery.toLowerCase())
            : true;

        return matchesFilter && matchesSearch;
    });

    const groupedData = filteredNotifications.reduce((acc, curr) => {
        const section = curr.timeAgo.toUpperCase() === 'YESTERDAY' ? 'Yesterday' : 'Today';
        let existingSection = acc.find((item) => item.title === section);
        if (existingSection) {
            existingSection.data.push(curr);
        } else {
            acc.push({ title: section, data: [curr] });
        }
        return acc;
    }, [] as { title: string; data: Notification[] }[]);

    // Sort to ensure 'Today' comes before 'Yesterday'
    groupedData.sort((a, b) => {
        if (a.title === 'Today' && b.title !== 'Today') return -1;
        if (b.title === 'Today' && a.title !== 'Today') return 1;
        return 0;
    });

    const handleBack = () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(tabs)/dashboard' as any);
        }
    };

    useEffect(() => {
        const onBackPress = () => {
            handleBack();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, []);

    return (
        <View className="flex-1 bg-white">
            <ScreenWrapper>
                <Header
                    variant="page"
                    title="Notifications"
                    showBack={true}
                    onBackPress={handleBack}
                />
                <Search
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search notifications..."
                    className="mb-5"
                    showFilter={false}
                />
                <NotificationsFilter
                    filters={FILTERS}
                    activeFilterId={activeFilter}
                    onFilterPress={setActiveFilter}
                />

                <SectionList
                    sections={groupedData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NotificationCard
                            notification={item}
                            onPress={(id) => console.log('Pressed notification', id)}
                        />
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text className="text-[16px] font-urbanist-medium text-[#18181B] mt-2 mb-3">
                            {title}
                        </Text>
                    )}
                    ListEmptyComponent={
                        <View style={styles.BoxStyle} className="py-12 px-6 items-center justify-center mt-4">
                            <View style={styles.IconStyle} className="w-14 h-14 rounded-2xl mb-3 items-center justify-center">
                                <NotificationBing size={28} color="#8A8A8E" variant="Linear" />
                            </View>
                            <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight text-center">
                                {searchQuery.trim() ? 'No matching notifications' : 'No notifications yet'}
                            </Text>
                            <Text className="text-[14px] font-urbanist-medium text-secondary mt-1.5 text-center max-w-[260px] leading-5">
                                {searchQuery.trim()
                                    ? 'Try searching with different keywords.'
                                    : "You're all caught up! There are no new notifications at the moment."}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                />
            </ScreenWrapper>
        </View>
    );
}
