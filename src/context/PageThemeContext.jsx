import { createContext, useContext } from 'react';

export const PageThemeContext = createContext('classic');
export const usePageTheme = () => useContext(PageThemeContext);
