import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { SearchNormal1, Setting4, CloseCircle } from 'iconsax-react-native';
import { X } from 'lucide-react-native';

export interface SearchProps extends Omit<TextInputProps, 'style'> {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  showFilter?: boolean;
  onFilterPress?: () => void;
  filterIcon?: React.ReactNode | React.ComponentType<any>;
  searchIcon?: React.ReactNode | React.ComponentType<any>;
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  inputClassName?: string;
}

/**
 * Reusable Circular Icon Button matching the Search pill radius with inner inset shadow.
 */
export function CircleIconButton({
  children,
  onPress,
  style,
  className = '',
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      
      className={`w-[48px] h-[48px] rounded-full bg-white border border-primary-border justify-center items-center shadow-[inset_4px_4px_4px_rgba(0,0,0,0.05),_inset_-4px_-4px_4px_rgba(0,0,0,0.05)] ${className}`}
    >
      <View className="items-center justify-center">
        {children}
      </View>
    </TouchableOpacity>
  );
}

function renderIcon(
  icon: React.ReactNode | React.ComponentType<any>,
  defaultIcon: React.ReactNode
): React.ReactNode {
  if (!icon) return defaultIcon;
  if (React.isValidElement(icon)) return icon;
  const IconComp = icon as React.ComponentType<any>;
  return <IconComp size={20} color="#626262" variant="Linear" />;
}

export default function Search({
  value,
  onChangeText,
  placeholder = 'Search students, batches...',
  showFilter = true,
  onFilterPress,
  filterIcon,
  searchIcon,
  onClear,
  style,
  className = '',
  inputClassName = '',
  ...restProps
}: SearchProps) {
  const handleClear = () => {
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={style} className={`flex-row items-center w-full px-5 py-2  ${className}`}>
      {/* Search Input Container with Full Circle / Pill Radius & Inset Shadow */}
      <View
       
        className={`flex-1 flex-row items-center bg-white border border-primary-border rounded-full px-4 h-[48px] shadow-[inset_4px_4px_4px_rgba(0,0,0,0.05),_inset_-4px_-4px_4px_rgba(0,0,0,0.05)] ${
          showFilter ? 'mr-3' : ''
        }`}
      >
        {/* Search Icon */}
        <View className="mr-2.5 items-center justify-center">
          {renderIcon(
            searchIcon,
            <SearchNormal1 size={20} color="#A2A2A7" variant="Linear" />
          )}
        </View>

        {/* Input Field */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A2A2A7"
          className={`flex-1 text-[15px] font-urbanist-medium text-primary p-0 ${inputClassName}`}
          {...restProps}
        />

        {/* Clear Button */}
        {!!value && (
          <TouchableOpacity activeOpacity={0.7} onPress={handleClear} className="ml-2">
            <X size={18} color="#A2A2A7"  />
          </TouchableOpacity>
        )}
      </View>

      {/* Separate Circular Filter Button (shown if showFilter is true) */}
      {showFilter && (
        <CircleIconButton onPress={onFilterPress}>
          {renderIcon(
            filterIcon,
            <Setting4 size={20} color="#626262" />
          )}
        </CircleIconButton>
      )}
    </View>
  );
}