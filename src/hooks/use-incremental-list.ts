import { useState, useEffect, useCallback, useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface UseIncrementalListOptions<T> {
  items: T[];
  pageSize?: number;
  isLoading?: boolean;
}

export function useIncrementalList<T>({
  items,
  pageSize = 15,
  isLoading = false,
}: UseIncrementalListOptions<T>) {
  const [displayCount, setDisplayCount] = useState<number>(() => Math.max(pageSize, 15));
  const lastLoadTimeRef = useRef<number>(0);

  // Sync display count immediately when items list length changes
  useEffect(() => {
    setDisplayCount(Math.max(pageSize, 15));
  }, [items.length, pageSize]);

  const loadMore = useCallback(() => {
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 80) return;
    lastLoadTimeRef.current = now;

    setDisplayCount((prevCount) => {
      if (prevCount >= items.length) return prevCount;
      return Math.min(prevCount + pageSize, items.length);
    });
  }, [items.length, pageSize]);

  const hasMore = displayCount < items.length;
  // If list is small to medium (<= 30 items), display all immediately without scroll throttling
  const displayedItems = isLoading
    ? []
    : items.length <= 30
    ? items
    : items.slice(0, displayCount);

  // Scroll threshold detection for ScrollView
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isLoading || !hasMore) return;

      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = 300;
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

