export interface Theme {
  id: string
  name: string
  bg: string
  bgSecondary: string
  bgTertiary: string
  border: string
  text: string
  textDim: string
  textMuted: string
  accent: string
  accentText: string
  success: string
  danger: string
  buttonBg: string
  buttonBorder: string
  inputBg: string
  inputBorder: string
}

export const themes: Record<string, Theme> = {
  dark: {
    id: 'dark',
    name: '다크',
    bg: '#1e1e2e',
    bgSecondary: '#181825',
    bgTertiary: '#313244',
    border: '#313244',
    text: '#cdd6f4',
    textDim: '#6c7086',
    textMuted: '#585b70',
    accent: '#89b4fa',
    accentText: '#1e1e2e',
    success: '#a6e3a1',
    danger: '#f38ba8',
    buttonBg: '#313244',
    buttonBorder: '#45475a',
    inputBg: '#313244',
    inputBorder: '#45475a'
  },
  light: {
    id: 'light',
    name: '라이트',
    bg: '#eff1f5',
    bgSecondary: '#e6e9ef',
    bgTertiary: '#ccd0da',
    border: '#bcc0cc',
    text: '#4c4f69',
    textDim: '#6c6f85',
    textMuted: '#9ca0b0',
    accent: '#1e66f5',
    accentText: '#ffffff',
    success: '#40a02b',
    danger: '#d20f39',
    buttonBg: '#dce0e8',
    buttonBorder: '#bcc0cc',
    inputBg: '#ffffff',
    inputBorder: '#bcc0cc'
  },
  blue: {
    id: 'blue',
    name: '블루',
    bg: '#1a1b2e',
    bgSecondary: '#141524',
    bgTertiary: '#252744',
    border: '#2d2f52',
    text: '#c8cef5',
    textDim: '#6e75a8',
    textMuted: '#4e5580',
    accent: '#5b8af5',
    accentText: '#ffffff',
    success: '#5bcea6',
    danger: '#f56b8a',
    buttonBg: '#252744',
    buttonBorder: '#363866',
    inputBg: '#252744',
    inputBorder: '#363866'
  },
  green: {
    id: 'green',
    name: '그린',
    bg: '#1a2e1e',
    bgSecondary: '#142418',
    bgTertiary: '#254430',
    border: '#2d5238',
    text: '#c8f5d0',
    textDim: '#6ea87a',
    textMuted: '#4e8058',
    accent: '#5bf57a',
    accentText: '#1a2e1e',
    success: '#5bf57a',
    danger: '#f56b6b',
    buttonBg: '#254430',
    buttonBorder: '#36663e',
    inputBg: '#254430',
    inputBorder: '#36663e'
  }
}

export const defaultThemeId = 'dark'
