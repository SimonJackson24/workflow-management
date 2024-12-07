// theme/globalStyles.ts

import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

export const globalStyles = (
  <MuiGlobalStyles
    styles={(theme) => ({
      '*': {
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      },
      html: {
        width: '100%',
        height: '100%',
        WebkitOverflowScrolling: 'touch',
      },
      body: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.background.default,
      },
      '#root': {
        width: '100%',
        height: '100%',
      },
      input: {
        '&[type=number]': {
          MozAppearance: 'textfield',
          '&::-webkit-outer-spin-button': {
            margin: 0,
            WebkitAppearance: 'none',
          },
          '&::-webkit-inner-spin-button': {
            margin: 0,
            WebkitAppearance: 'none',
          },
        },
      },
      img: {
        display: 'block',
        maxWidth: '100%',
      },
      ul: {
        margin: 0,
        padding: 0,
        listStyle: 'none',
      },
      a: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
        },
      },
      '.scrollbar-hidden::-webkit-scrollbar': {
        display: 'none',
      },
      '.scrollbar-hidden': {
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      },
      '.text-ellipsis': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    })}
  />
);
