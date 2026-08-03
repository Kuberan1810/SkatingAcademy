import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

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
            className={`px-5 py-2.5 rounded-[16px] border flex-row items-center justify-center ${
              isActive
                ? `bg-black border-black ${activeTabClassName}`
                : `bg-[#F8F7FA] border-[#F0ECF8] ${inactiveTabClassName}`
            } ${tabClassName}`}
          >
            <Text
              className={`text-[16px] -tracking-[0.3px] ${
                isActive
                  ? `font-urbanist-medium text-white ${activeTextClassName}`
                  : `font-urbanist-regular text-[#626262] ${inactiveTextClassName}`
              } ${textClassName}`}
            >
              {tabLabel}
            </Text>
            {count !== undefined && (
              <View
                className={`ml-2 px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-black/5'
                }`}
              >
                <Text
                  className={`text-[12px] font-urbanist-semibold ${
                    isActive ? 'text-white' : 'text-[#626262]'
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      className="flex-grow-0"
    >
      {renderTabs()}
    </ScrollView>
  );
}
