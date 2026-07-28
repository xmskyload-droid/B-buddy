import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme/colors';

export const useTheme = () => {
  const { mode, toggleTheme, setTheme } = useThemeStore();
  
  return {
    mode,
    colors: colors[mode],
    toggleTheme,
    setTheme,
    isDark: mode === 'dark'
  };
};
