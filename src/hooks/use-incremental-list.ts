import { useState, useEffect, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface UseIncrementalListOptions<T> {
  items: T[];
  pageSize?: number;
  isLoading?: boolean;
}

export function useIncrementalList<T>({
  items,
  pageSize = 10,
  isLoading = false,
}: UseIncrementalListOptions<T>) {
  const [displayCount, setDisplayCount] = useState<number>(pageSize);

  // Reset display count when items list length or content identity changes
  useEffect(() => {
    setDisplayCount(pageSize);
  }, [items.length, pageSize]);

  const loadMore = useCallback(() => {
    setDisplayCount((prevCount) => {
      if (prevCount >= items.length) return prevCount;
      return Math.min(prevCount + pageSize, items.length);
    });
  }, [items.length, pageSize]);

  const hasMore = displayCount < items.length;
  const displayedItems = isLoading ? [] : items.slice(0, displayCount);

  // Scroll threshold detection for ScrollView
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isLoading || !hasMore) return;

      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = 150; // Trigger load 150px before bottom
      const isNearEnd =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

      if (isNearEnd) {
        loadMore();
      }
    },
    [isLoading, hasMore, loadMore]
  );

  return {
    displayedItems,
    hasMore,
    totalItems: items.length,
    loadMore,
    onScroll,
  };
}
