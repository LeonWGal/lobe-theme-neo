import type { ThemeRegistration } from 'shiki';

export const themeConfig = (isDarkMode: boolean): ThemeRegistration => {
  const type = isDarkMode ? 'dark' : 'light';

  const colorYellow = isDarkMode ? '#fde68a' : '#854d0e';
  const colorOrange = isDarkMode ? '#fcd34d' : '#92400e';
  const colorVolcano = isDarkMode ? '#fdba74' : '#9a3412';
  const colorText = isDarkMode ? '#e5e7eb' : '#1f2937';
  const colorBlue = isDarkMode ? '#93c5fd' : '#1d4ed8';
  const colorPurple = isDarkMode ? '#c4b5fd' : '#6d28d9';
  return {
    colors: {
      'editor.foreground': colorText,
    },
    name: type,
    tokenColors: [
      {
        scope: 'comma',
        settings: {
          foreground: colorText,
        },
      },
      {
        scope: ['and', 'break'],
        settings: {
          foreground: colorBlue,
        },
      },
      {
        scope: 'bracket',
        settings: {
          foreground: colorPurple,
        },
      },
      {
        scope: 'model-type',
        settings: {
          fontStyle: 'italic',
          foreground: colorVolcano,
        },
      },
      {
        scope: 'model-name',
        settings: {
          foreground: colorOrange,
        },
      },
      {
        scope: 'model-bracket',
        settings: {
          foreground: colorPurple,
        },
      },
      {
        scope: 'number',
        settings: {
          foreground: colorPurple,
        },
      },
      {
        scope: 'func',
        settings: {
          foreground: colorPurple,
        },
      },
      {
        scope: 'wildcards',
        settings: {
          foreground: colorYellow,
        },
      },
    ],
    type,
  };
};
