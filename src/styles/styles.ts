import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#333333',
  secondary: '#626262',
  light: '#999999',
  greenPrimary: '#02763D',
  greenLight: 'rgba(2, 118, 61, 0.10)',
  greenBorder: '#BBDBCC',
  danger: '#E70C0C',
  primaryBorder:'#F2EEF4'
};

export const styles = StyleSheet.create({
  IconStyle: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2EEF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  BoxStyle: {
    paddingBlock: 28,
    paddingInline: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F2EEF4',
    backgroundColor: '#FDFDFD',
  },
  InnerShadowStyle: {
    boxShadow: [
      {
        offsetX: 4,
        offsetY: 4,
        blurRadius: 4,
        spreadDistance: 0,
        color: 'rgba(255, 255, 255, 0.25)',
        inset: true,
      },
      {
        offsetX: -4,
        offsetY: -4,
        blurRadius: 4,
        spreadDistance: 0,
        color: 'rgba(0, 0, 0, 0.15)',
        inset: true,
      },
    ] as any,
  },
  BlackInnerShadowStyle: {
    boxShadow: [
      {
        offsetX: 4,
        offsetY: 4,
        blurRadius: 4,
        spreadDistance: 0,
        color: 'rgba(0, 0, 0, 0.05)',
        inset: true,
      },
    ] as any,
  },
  GreenShadowStyle: {
    boxShadow: [
      {
        offsetX: 4,
        offsetY: 4,
        blurRadius: 4,
        spreadDistance: 0,
        color: 'rgba(2, 118, 61, 0.10)',
        inset: true,
      },
      {
        offsetX: -4,
        offsetY: -4,
        blurRadius: 4,
        spreadDistance: 0,
        color: 'rgba(2, 118, 61, 0.10)',
        inset: true,
      },
    ] as any,
  },
  BlackShadowStyle: {
    boxShadow: [
      {
        offsetX: 4,
        offsetY: 4,
        blurRadius: 4,
        spreadDistance: 0,
        color: 'rgba(0, 0, 0, 0.25)',
        inset: true,
      },
      {
        offsetX: -4,
        offsetY: -4,
        blurRadius: 4,
        spreadDistance: 0,
        color: 'rgba(0, 0, 0, 0.25)',
        inset: true,
      },
    ] as any,
  },
});

export default styles;
