import React, { createContext, useContext, useState, useRef } from 'react';
import { useSharedValue, SharedValue, withTiming } from 'react-native-reanimated';
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

  const hideTabBar = () => {
    tabBarOffset.value = withTiming(120, { duration: 300 });
  };

  const showTabBar = () => {
    tabBarOffset.value = withTiming(0, { duration: 300 });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (currentY <= 10) {
      showTabBar();
    } else if (diff > 10 && currentY > 50) {
      hideTabBar();
    } else if (diff < -10) {
      showTabBar();
    }

    lastScrollY.current = currentY;
  };

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
