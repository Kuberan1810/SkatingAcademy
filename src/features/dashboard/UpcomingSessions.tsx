import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import FiltersTabs from '@/components/ui/FiltersTabs';
import BtnCom from '@/components/ui/BtnCom';

export interface UpcomingSessionsProps {
    date?: string;
    onViewAllPress?: () => void;
    style?: StyleProp<ViewStyle>;
    className?: string;
}

export default function UpcomingSessions({
    date = 'Friday, 15 Jan, 2024',
    onViewAllPress,
    style,
    className = '',
}: UpcomingSessionsProps) {
    const [activeFilter, setActiveFilter] = useState('All');

    return (
        <View style={style} className={`mt-6 ${className}`}>
            {/* Header Row: Title & Date + View All Button */}
            <View className="flex-row items-center justify-between mb-5">
                <View className="flex-1 mr-3">
                    <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight">
                        Upcoming Sessions
                    </Text>
                    <Text className="text-[15px] font-urbanist-medium text-light mt-0.5">
                        {date}
                    </Text>
                </View>

                <BtnCom
                    label='View all'
                    onClick={onViewAllPress}

                />
            </View>

            {/* Filter Tabs */}
            <FiltersTabs
                tabs={['All', 'Morning', 'Afternoon', 'Evening']}
                activeTab={activeFilter}
                onSelectTab={setActiveFilter}
                scrollable={false}
            />
        </View>
    );
}
