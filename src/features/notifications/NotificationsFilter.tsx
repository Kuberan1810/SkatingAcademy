import React from 'react';
import { View } from 'react-native';
import { NotificationFilter } from './types';
import FiltersTabs from '@/components/ui/FiltersTabs';

interface NotificationsFilterProps {
    filters: NotificationFilter[];
    activeFilterId: string;
    onFilterPress: (id: string) => void;
}

export default function NotificationsFilter({
    filters,
    activeFilterId,
    onFilterPress,
}: NotificationsFilterProps) {
    return (
        <View className=" pl-5 mb-4">
            <FiltersTabs
                tabs={filters}
                activeTab={activeFilterId}
                onSelectTab={onFilterPress}
            />
        </View>
    );
}
