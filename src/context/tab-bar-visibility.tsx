import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useSharedValue, SharedValue, withTiming, Easing } from 'react-native-reanimated';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface TabBarVisibilityContextType {
  tabBarOffset: SharedValue<number>;
  isTabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
  hideTabBar: () => void;
  showTabBar: () => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType | undefined>(undefined);

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const tabBarOffset = useSharedValue(0);
  const [isTabBarVisible, setTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isHiddenRef = useRef(false);

  // Unconditionally animate offset to 120 (hidden) without getting stuck
  const hideTabBar = useCallback(() => {
    isHiddenRef.current = true;
    setTabBarVisible(false);
    tabBarOffset.value = withTiming(120, { duration: 200, easing: Easing.out(Easing.ease) });
  }, [tabBarOffset]);

  // Unconditionally animate offset to 0 (visible) without getting stuck
  const showTabBar = useCallback(() => {
    isHiddenRef.current = false;
    setTabBarVisible(true);
    tabBarOffset.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
  }, [tabBarOffset]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // At top of screen, always reveal navbar
    if (currentY <= 10) {
      if (isHiddenRef.current) {
        isHiddenRef.current = false;
        tabBarOffset.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
      }
    } else if (diff > 15 && currentY > 60) {
      // Scrolling down -> hide navbar
      if (!isHiddenRef.current) {
        isHiddenRef.current = true;
        tabBarOffset.value = withTiming(120, { duration: 200, easing: Easing.in(Easing.ease) });
      }
    } else if (diff < -15) {
      // Scrolling up -> reveal navbar
      if (isHiddenRef.current) {
        isHiddenRef.current = false;
        tabBarOffset.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
      }
    }

    lastScrollY.current = currentY;
  }, [tabBarOffset]);

  return (
    <TabBarVisibilityContext.Provider
      value={{
        tabBarOffset,
        isTabBarVisible,
        setTabBarVisible,
        hideTabBar,
        showTabBar,
        handleScroll,
      }}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error('useTabBarVisibility must be used within a TabBarVisibilityProvider');
  }
  return context;
}
