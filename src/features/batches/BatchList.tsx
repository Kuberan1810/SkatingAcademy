import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';
import { Layer } from 'iconsax-react-native';
import { router } from 'expo-router';
import FiltersTabs from '@/components/ui/FiltersTabs';
import BatchCard, { BatchCardProps } from '@/components/ui/BatchCard';
import BatchOptionsBottomSheet from '@/components/ui/BatchOptionsBottomSheet';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import Toast from '@/components/ui/Toast';
import styles from '@/styles/styles';
import { ApiBatchItem } from '@/types/batch';
import { BatchCardSkeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { useDeleteBatch, prefetchBatchStudents } from '@/hooks/use-batches';
import { useQueryClient } from '@tanstack/react-query';
import { useIncrementalList } from '@/hooks/use-incremental-list';

import ScheduleCompensationModal from './components/ScheduleCompensationModal';

export interface BatchItem extends BatchCardProps {
    id: string;
    category?: string;
    session_id?: string;
    sessionId?: string;
}

export interface BatchListProps {
    title?: string;
    batches?: (BatchItem | ApiBatchItem)[];
    isLoading?: boolean;
    loadingBatchId?: string | number | null;
    tabs?: string[];
    emptyText?: string;
    onBatchPress?: (item: BatchItem) => void;
    onStartPress?: (item: BatchItem) => void;
    onAttendancePress?: (item: BatchItem) => void;
    onMorePress?: (item: BatchItem) => void;
    onScheduleExtraClass?: (item: BatchItem) => void;
    onViewDetails?: (item: BatchItem) => void;
    onEditBatch?: (item: BatchItem) => void;
    onDeleteBatch?: (item: BatchItem) => void;
    onTabChange?: (tab: string) => void;
    onScrollListener?: (onScroll: (e: any) => void) => void;
    searchQuery?: string;
    sortBy?: string;
    style?: StyleProp<ViewStyle>;
    className?: string;
}

const mapToBatchItem = (b: BatchItem | ApiBatchItem): BatchItem => {
    const raw = b as any;
    const sId = raw.session_id || raw.sessionId ? String(raw.session_id || raw.sessionId) : undefined;
    return {
        id: String(raw.id),
        session_id: sId,
        sessionId: sId,
        title: raw.title || raw.batch_name || 'Batch',
        date: raw.date || '',
        time: raw.time || '',
        studentsCount: raw.students_count ?? raw.studentsCount ?? 0,
        status: raw.status || 'upcoming',
        category: raw.category || 'Morning',
        attendance: raw.attendance ?? undefined,
        actionLabel: raw.actionLabel,
    };
};

export default function BatchList({
    title = 'Batches',
    batches = [],
    isLoading = false,
    loadingBatchId,
    tabs = ['All', 'Today', 'Morning', 'Evening', 'Completed', 'No Class'],
    emptyText = 'No batches found',
    onBatchPress,
    onStartPress,
    onAttendancePress,
    onMorePress,
    onScheduleExtraClass,
    onViewDetails,
    onEditBatch,
    onDeleteBatch,
    onTabChange,
    onScrollListener,
    searchQuery = '',
    sortBy = 'recent',
    style,
    className = '',
}: BatchListProps) {
    const deleteBatchMutation = useDeleteBatch();
    const queryClient = useQueryClient();

    const normalizedBatches = React.useMemo(() => {
        return batches.map(mapToBatchItem);
    }, [batches]);

    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
    const [batchToDelete, setBatchToDelete] = useState<BatchItem | null>(null);
    const [batchToScheduleCompensation, setBatchToScheduleCompensation] = useState<BatchItem | null>(null);
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);

    // Toast State
    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'delete' | 'error';
    }>({
        visible: false,
        message: '',
        type: 'delete',
    });

    const filteredBatches = React.useMemo(() => {
        let result = normalizedBatches.filter((batch) => {
            const matchesSearch = batch.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            const normalizedStatus = (batch.status || '').toLowerCase();
            const isCompleted = normalizedStatus === 'completed';
            const isNoClass =
                normalizedStatus === 'no_class' ||
                normalizedStatus === 'noclass' ||
                normalizedStatus === 'no class' ||
                (batch.actionLabel || '').toLowerCase() === 'no class';

            if (activeFilter === 'All') return true;
            if (activeFilter === 'Today') {
                const dateStr = (batch.date || '').toLowerCase();
                return dateStr.includes('today') || (!isCompleted && !isNoClass);
            }
            if (activeFilter === 'Morning') return batch.category === 'Morning' || batch.title.toLowerCase().includes('morning');
            if (activeFilter === 'Evening') return batch.category === 'Evening' || batch.title.toLowerCase().includes('evening');
            if (activeFilter === 'Completed') return isCompleted;
            if (activeFilter === 'No Class' || activeFilter === 'NoClass') return isNoClass;
            return true;
        });

        // Apply sorting
        switch (sortBy) {
            case 'name_asc':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'name_desc':
                result.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'most_students':
                result.sort((a, b) => (parseInt(String(b.studentsCount || '0'), 10) || 0) - (parseInt(String(a.studentsCount || '0'), 10) || 0));
                break;
            case 'least_students':
                result.sort((a, b) => (parseInt(String(a.studentsCount || '0'), 10) || 0) - (parseInt(String(b.studentsCount || '0'), 10) || 0));
                break;
            case 'recent':
            default:
                break;
        }

        return result;
    }, [normalizedBatches, activeFilter, searchQuery, sortBy]);

    const {
        displayedItems: displayedBatches,
        hasMore: hasMoreBatches,
        onScroll: onIncrementalScroll,
    } = useIncrementalList({
        items: filteredBatches,
        pageSize: 10,
        isLoading,
    });

    useEffect(() => {
        if (onScrollListener && onIncrementalScroll) {
            onScrollListener(onIncrementalScroll);
        }
    }, [onIncrementalScroll, onScrollListener]);

    const handleTabSelect = useCallback((tab: string) => {
        setActiveFilter(tab);
        onTabChange?.(tab);
    }, [onTabChange]);

    const handleOpenOptions = useCallback((item: BatchItem) => {
        setSelectedBatch(item);
        setIsOptionsVisible(true);
        onMorePress?.(item);
    }, [onMorePress]);

    const handleBatchPress = useCallback((item: BatchItem) => {
        if (item.id) {
            prefetchBatchStudents(queryClient, item.id);
        }
        if (onBatchPress) {
            onBatchPress(item);
        } else if ((item.status || '').toLowerCase() === 'no_class' || (item.status || '').toLowerCase() === 'noclass') {
            const targetSessionId = item.sessionId || item.session_id || item.id;
            router.push({
                pathname: '/(tabs)/batches/completed-class',
                params: {
                    title: item.title,
                    sessionId: targetSessionId,
                    from: 'batches',
                },
            } as any);
        } else {
            router.push({
                pathname: '/(tabs)/batches/StudentListScreen',
                params: {
                    id: String(item.id),
                    title: item.title,
                    batch_name: item.title,
                    totalStudents: item.studentsCount ? `${item.studentsCount} Students` : undefined,
                    avgAttendance: item.attendance ? `${item.attendance}` : undefined,
                },
            } as any);
        }
    }, [onBatchPress, queryClient]);

    const handleActionPress = useCallback((item: BatchItem) => {
        const isCompleted = (item.status || '').toLowerCase() === 'completed';
        if (isCompleted) {
            if (onAttendancePress) {
                onAttendancePress(item);
            } else {
                const targetSessionId = item.sessionId || item.session_id || item.id;
                router.push({
                    pathname: '/(tabs)/batches/completed-class',
                    params: {
                        title: item.title,
                        sessionId: targetSessionId,
                        from: 'batches',
                    },
                } as any);
            }
        } else {
            if (onStartPress) {
                onStartPress(item);
            } else {
                router.push('/(tabs)/batches/start-class' as any);
            }
        }
    }, [onAttendancePress, onStartPress]);

    return (
        <View style={style} className={`mt-[30px] ${className}`}>
            {/* Toast Banner */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
            />

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
                {isLoading && filteredBatches.length === 0 ? (
                    <SkeletonGroup>
                        <BatchCardSkeleton />
                        <BatchCardSkeleton />
                        <BatchCardSkeleton />
                    </SkeletonGroup>
                ) : filteredBatches.length > 0 ? (
                    <>
                        {displayedBatches.map((item) => (
                            <BatchCard
                                key={item.id}
                                title={item.title}
                                time={item.time}
                                studentsCount={item.studentsCount}
                                date={item.date}
                                attendance={item.attendance}
                                status={item.status}
                                actionLabel={item.actionLabel}
                                loading={String(item.id) === String(loadingBatchId)}
                                onPressCard={() => handleBatchPress(item)}
                                onActionPress={() => handleActionPress(item)}
                                onMorePress={() => handleOpenOptions(item)}
                            />
                        ))}
                        {hasMoreBatches && (
                            <View className="py-4 flex-row items-center justify-center gap-2">
                                <ActivityIndicator size="small" color="#8A8A8E" />
                                <Text className="text-[13px] font-urbanist-medium text-secondary">
                                    Loading more batches...
                                </Text>
                            </View>
                        )}
                    </>
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
                onScheduleExtraClass={(batch) => {
                    setIsOptionsVisible(false);
                    setTimeout(() => {
                        setBatchToScheduleCompensation(batch as BatchItem);
                        onScheduleExtraClass?.(batch as BatchItem);
                    }, 200);
                }}
                onViewDetails={(batch) => onViewDetails?.(batch as BatchItem)}
                onEditBatch={(batch) => onEditBatch?.(batch as BatchItem)}
                onManageAttendance={(batch) => onAttendancePress?.(batch as BatchItem)}
                onDeleteBatch={(batch) => {
                    setIsOptionsVisible(false);
                    setTimeout(() => {
                        setBatchToDelete(batch as BatchItem);
                    }, 250);
                }}
            />

            {/* Schedule Extra / Compensation Class Modal */}
            <ScheduleCompensationModal
                visible={!!batchToScheduleCompensation}
                batch={batchToScheduleCompensation}
                onClose={() => setBatchToScheduleCompensation(null)}
                onSuccess={(msg) => {
                    setToast({
                        visible: true,
                        message: msg,
                        type: 'success',
                    });
                }}
            />

            {/* Delete Batch Confirmation Sheet */}
            <DeleteConfirmationModal
                visible={!!batchToDelete}
                title="Delete Batch"
                itemName={batchToDelete?.title}
                message={`Are you sure you want to remove ${batchToDelete?.title}? All enrolled students in this batch will be affected. This action cannot be undone.`}
                confirmText="Yes, Delete"
                isLoading={deleteBatchMutation.isPending}
                onClose={() => setBatchToDelete(null)}
                onConfirm={() => {
                    if (batchToDelete) {
                        const targetTitle = batchToDelete.title;
                        deleteBatchMutation.mutate(batchToDelete.id, {
                            onSuccess: () => {
                                setToast({
                                    visible: true,
                                    message: `${targetTitle} deleted successfully!`,
                                    type: 'delete',
                                });
                                onDeleteBatch?.(batchToDelete);
                                setBatchToDelete(null);
                            },
                            onError: () => {
                                setBatchToDelete(null);
                            },
                        });
                    }
                }}
            />
        </View>
    );
}
