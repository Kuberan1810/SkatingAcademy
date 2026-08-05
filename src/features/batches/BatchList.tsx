import React, { useState } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Layer } from 'iconsax-react-native';
import { router } from 'expo-router';
import FiltersTabs from '@/components/ui/FiltersTabs';
import BatchCard, { BatchCardProps } from '@/components/ui/BatchCard';
import BatchOptionsBottomSheet from '@/components/ui/BatchOptionsBottomSheet';
import styles from '@/styles/styles';

export interface BatchItem extends BatchCardProps {
    id: string;
    category?: string;
}

export interface BatchListProps {
    title?: string;
    batches?: BatchItem[];
    tabs?: string[];
    emptyText?: string;
    onBatchPress?: (item: BatchItem) => void;
    onStartPress?: (item: BatchItem) => void;
    onAttendancePress?: (item: BatchItem) => void;
    onMorePress?: (item: BatchItem) => void;
    onViewDetails?: (item: BatchItem) => void;
    onEditBatch?: (item: BatchItem) => void;
    onDeleteBatch?: (item: BatchItem) => void;
    onTabChange?: (tab: string) => void;
    style?: StyleProp<ViewStyle>;
    className?: string;
}

const DEFAULT_BATCHES: BatchItem[] = [
    {
        id: '1',
        title: 'Morning Batch 2',
        date: '10 Jul 2026',
        time: '9:00 - 10:00 am',
        studentsCount: 24,
        status: 'completed',
        category: 'Morning',
    },
    {
        id: '2',
        title: 'Evening Batch',
        date: '10 Jul 2026',
        time: '9:00 - 10:00 am',
        studentsCount: 24,
        status: 'upcoming',
        category: 'Evening',
    },
    {
        id: '3',
        title: 'Morning Batch',
        date: '10 Jul 2026',
        attendance: '20/24',
        time: '9:00 - 10:00 am',
        studentsCount: 24,
        status: 'upcoming',
        category: 'Morning',
    },
];

export default function BatchList({
    title = 'Batches',
    batches = DEFAULT_BATCHES,
    tabs = ['All', 'Today', 'Morning', 'Evening', 'Completed'],
    emptyText = 'No batches found',
    onBatchPress,
    onStartPress,
    onAttendancePress,
    onMorePress,
    onViewDetails,
    onEditBatch,
    onDeleteBatch,
    onTabChange,
    style,
    className = '',
}: BatchListProps) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);

    const filteredBatches = batches.filter((batch) => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Completed') return batch.status === 'completed' || !!batch.attendance;
        if (activeFilter === 'Morning') return batch.category === 'Morning' || batch.title.toLowerCase().includes('morning');
        if (activeFilter === 'Evening') return batch.category === 'Evening' || batch.title.toLowerCase().includes('evening');
        return true;
    });

    const handleTabSelect = (tab: string) => {
        setActiveFilter(tab);
        onTabChange?.(tab);
    };

    const handleOpenOptions = (item: BatchItem) => {
        setSelectedBatch(item);
        setIsOptionsVisible(true);
        onMorePress?.(item);
    };

    return (
        <View style={style} className={`mt-[30px] ${className}`}>
            {/* Section Header */}
            {!!title && (
                <View className="flex-row items-center justify-between mb-5">
                    <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight">
                        {title}
                    </Text>
                </View>
            )}

            {/* Filter Tabs */}
            <FiltersTabs
                tabs={tabs}
                activeTab={activeFilter}
                onSelectTab={handleTabSelect}
                scrollable={true}
                containerClassName="mb-5"
            />

            {/* Batch Cards List */}
            <View className="gap-5">
                {filteredBatches.length > 0 ? (
                    filteredBatches.map((item) => (
                        <BatchCard
                            key={item.id}
                            title={item.title}
                            time={item.time}
                            studentsCount={item.studentsCount}
                            date={item.date}
                            attendance={item.attendance}
                            status={item.status}
                            actionLabel={item.actionLabel}
                            onPressCard={() =>
                                onBatchPress
                                    ? onBatchPress(item)
                                    : router.push('/(tabs)/batches/StudentListScreen')
                            }
                            onActionPress={() =>
                                item.status === 'completed' || item.attendance
                                    ? onAttendancePress?.(item)
                                    : onStartPress?.(item)
                            }
                            onMorePress={() => handleOpenOptions(item)}
                        />
                    ))
                ) : (
                    <View style={styles.BoxStyle} className="py-8 items-center justify-center">
                        <View style={styles.IconStyle} className="mb-2 p-2.5">
                            <Layer size={24} color="#8A8A8E" variant="Linear" />
                        </View>
                        <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
                            {emptyText}
                        </Text>
                        <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
                            There are no batches matching your selected filter.
                        </Text>
                    </View>
                )}
            </View>

            {/* Reusable Batch Options Drawer / Bottom Sheet */}
            <BatchOptionsBottomSheet
                visible={isOptionsVisible}
                batch={selectedBatch}
                onClose={() => setIsOptionsVisible(false)}
                onViewDetails={(batch) => onViewDetails?.(batch as BatchItem)}
                onEditBatch={(batch) => onEditBatch?.(batch as BatchItem)}
                onManageAttendance={(batch) => onAttendancePress?.(batch as BatchItem)}
                onDeleteBatch={(batch) => onDeleteBatch?.(batch as BatchItem)}
            />
        </View>
    );
}
