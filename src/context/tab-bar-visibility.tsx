import React, { createContext, useContext, useState } from 'react';
import { useSharedValue, SharedValue } from 'react-native-reanimated';

interface TabBarVisibilityContextType {
  tabBarOffset: SharedValue<number>;
  isTabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType | undefined>(undefined);

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const tabBarOffset = useSharedValue(0);
  const [isTabBarVisible, setTabBarVisible] = useState(true);

  return (
    <TabBarVisibilityContext.Provider value={{ tabBarOffset, isTabBarVisible, setTabBarVisible }}>
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
