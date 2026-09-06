import React from 'react';
import { View, Text, StyleProp, ViewStyle, ImageStyle, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import styles from '@/styles/styles';

export const getStudentInitials = (name: string): string => {
  if (!name || !name.trim()) return 'ST';
  const clean = name.trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  return clean.toUpperCase();
};

const AVATAR_PALETTES = [
  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE80' }, // Soft Blue
  { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE80' }, // Soft Purple
  { bg: '#ECFDF5', text: '#059669', border: '#A7F3D080' }, // Soft Emerald
  { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD580' }, // Soft Orange
  { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE880' }, // Soft Pink
];

const avatarColorCache = new Map<string, typeof AVATAR_PALETTES[0]>();

export const getAvatarColor = (name: string) => {
  if (!name) return AVATAR_PALETTES[0];
  const cached = avatarColorCache.get(name);
  if (cached) return cached;

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  const palette = AVATAR_PALETTES[index];
  avatarColorCache.set(name, palette);
  return palette;
};

export interface StudentAvatarProps {
  name: string;
  avatarUri?: string | ImageSourcePropType | null;
  size?: number;
  style?: StyleProp<any>;
  className?: string;
}

function StudentAvatar({
  name,
  avatarUri,
  size = 40,
  style,
  className = '',
}: StudentAvatarProps) {
  const hasUri =
    avatarUri &&
    typeof avatarUri === 'string' &&
    avatarUri.trim() !== '' &&
    avatarUri !== 'null';

  if (hasUri) {
    return (
      <Image
        source={{ uri: avatarUri as string }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
        className={className}
        contentFit="cover"
        transition={200}
      />
    );
  }

  if (typeof avatarUri === 'object' && avatarUri !== null) {
    return (
      <Image
        source={avatarUri}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
        className={className}
        contentFit="cover"
        transition={200}
      />
    );
  }

  const initials = getStudentInitials(name);
  const palette = getAvatarColor(name);
  const fontSize = Math.max(10, Math.floor(size * 0.38));

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: 1,
        },
        style,
        styles.BlackInnerShadowStyle
      ]}
      className={`items-center justify-center ${className}`}
    >
      <Text
        style={{ color: palette.text, fontSize }}
        className="font-urbanist-bold tracking-wider"
      >
        {initials}
      </Text>
    </View>
  );
}

export default React.memo(StudentAvatar);

