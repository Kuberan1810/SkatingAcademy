import styles from '@/styles/styles';
import React from 'react';
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

export interface FilterItem {
  id: string;
  label: string;
  count?: number;
}

export type FilterOption = string | FilterItem;

export interface FiltersTabsProps {
  /** Array of tab labels or FilterItem objects */
  tabs: FilterOption[];
  /** Currently selected tab id or label */
  activeTab: string;
  /** Callback fired when a tab is pressed */
  onSelectTab: (tabId: string) => void;
  /** Whether the tabs render in a horizontal scrollable view (default: true) */
  scrollable?: boolean;
  /** Custom style for ScrollView content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Custom container style */
  containerStyle?: StyleProp<ViewStyle>;
  /** Custom Tailwind class for container */
  containerClassName?: string;
  /** Additional custom class applied to every tab */
  tabClassName?: string;
  /** Custom class for active tab */
  activeTabClassName?: string;
  /** Custom class for inactive tab */
  inactiveTabClassName?: string;
  /** Additional custom class for tab text */
  textClassName?: string;
  /** Custom text class for active tab */
  activeTextClassName?: string;
  /** Custom text class for inactive tab */
  inactiveTextClassName?: string;
}

const getTabId = (tab: FilterOption): string =>
  typeof tab === 'string' ? tab : tab.id;

const getTabLabel = (tab: FilterOption): string =>
  typeof tab === 'string' ? tab : tab.label;

export default function FiltersTabs({
  tabs,
  activeTab,
  onSelectTab,
  scrollable = true,
  contentContainerStyle,
  containerStyle,
  containerClassName = '',
  tabClassName = '',
  activeTabClassName = '',
  inactiveTabClassName = '',
  textClassName = '',
  activeTextClassName = '',
  inactiveTextClassName = '',
}: FiltersTabsProps) {
  const renderTabs = () => (
    <View className={`flex-row items-center gap-2.5 ${containerClassName}`} style={containerStyle}>
      {tabs.map((tab) => {
        const tabId = getTabId(tab);
        const tabLabel = getTabLabel(tab);
        const count = typeof tab === 'object' ? tab.count : undefined;
        const isActive = activeTab === tabId;

        return (
          <TouchableOpacity
            key={tabId}
            activeOpacity={0.7}
            onPress={() => onSelectTab(tabId)}
            style={isActive ? [styles.InnerShadowStyle] : [styles.BlackInnerShadowStyle]}
            className={`px-5 py-3 rounded-[10px] border flex-row items-center justify-center ${isActive
              ? `bg-black border-black ${activeTabClassName}`
              : `bg-[#F7F7F7] border-primary-border  ${inactiveTabClassName}`
              } ${tabClassName}`}
          >
            <Text
              className={`text-[16px] -tracking-[0.3px] ${isActive
                  ? `font-urbanist-medium text-white ${activeTextClassName}`
                  : `font-urbanist-medium text-[#626262] ${inactiveTextClassName}`
                } ${textClassName}`}
            >
              {tabLabel}
            </Text>
            {count !== undefined && (
              <View
                className={`ml-2 px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-black/5'
                  }`}
              >
                <Text
                  className={`text-[12px] font-urbanist-semibold ${isActive ? 'text-white' : 'text-[#626262]'
                    }`}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (!scrollable) {
    return renderTabs();
  }

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={1}
      decelerationRate={0.998}
      bounces={true}
      alwaysBounceHorizontal={true}
      directionalLockEnabled={true}
      overScrollMode="never"
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ paddingHorizontal: 20 }, contentContainerStyle]}
      className="-mx-5 flex-grow-0"
    >
      {renderTabs()}
    </Animated.ScrollView>
  );
}
