import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import NotificationCard from '@/features/notifications/NotificationCard';
import NotificationsFilter from '@/features/notifications/NotificationsFilter';
import { Notification, NotificationFilter as FilterType } from '@/features/notifications/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SectionList, Text, View } from 'react-native';

const MOCK_FILTERS: FilterType[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: 2 },
    { id: 'fees', label: 'Fees' },
    { id: 'attendance', label: 'Attendance' },
];

const MOCK_NOTIFICATIONS: Notification[] = [
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
];

export default function NotificationsScreen() {
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredNotifications = MOCK_NOTIFICATIONS.filter((notif) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unread') return notif.isUnread;
        return notif.type === activeFilter;
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
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push('/(tabs)/dashboard');
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScreenWrapper>
                <Header
                    variant="page"
                    title="Notifications"
                    showBack={true}
                    onBackPress={handleBack}

                />
                <Search placeholder="Search notifications..."
                    className='mb-5'
                    showFilter={false}
                />
                <NotificationsFilter
                    filters={MOCK_FILTERS}
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
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 }}
                    showsVerticalScrollIndicator={false}
                />
            </ScreenWrapper>
        </View>
    );
}
