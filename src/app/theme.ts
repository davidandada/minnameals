'use client';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark'
  }
});

export default responsiveFontSizes(theme);