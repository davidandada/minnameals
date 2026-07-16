'use client';
import { createTheme, PaletteColor, PaletteColorOptions, responsiveFontSizes } from '@mui/material/styles';
import brandColours from './colours';

type CustomColourName = keyof typeof brandColours;

declare module '@mui/material/styles' {
  interface Palette extends Record<CustomColourName, PaletteColor> { }
  interface PaletteOptions extends Partial<Record<CustomColourName, PaletteColorOptions>> { }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides extends Record<CustomColourName, true> { }
}
declare module '@mui/material/TextField' {
  interface TextFieldPropsColorOverrides extends Record<CustomColourName, true> { }
}

declare module '@mui/material/CircularProgress' {
  interface CircularProgressPropsColorOverrides extends Record<CustomColourName, true> { }
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides extends Record<CustomColourName, true> { }
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides extends Record<CustomColourName, true> { }
}

// Light-background palette colours need dark text to meet WCAG AA contrast.
// Dark-background colours (red, grey) keep white text.
const contrastTextMap: Partial<Record<CustomColourName, string>> = {
  baedaYellow: '#1a1a1a',
  baedaGreen:  '#1a1a1a',
  baedaOrange: '#1a1a1a',
  baedaPink:   '#1a1a1a',
  baedaBlue:   '#1a1a1a',
};

const customPaletteOptions = Object.entries(brandColours).reduce(
  (acc, [colourName, colourScale]) => {
    acc[colourName as CustomColourName] = {
      main: colourScale[500],
      light: colourScale[300],
      dark: colourScale[700],
      contrastText: contrastTextMap[colourName as CustomColourName] ?? '#ffffff',
      ...colourScale,
    };
    return acc;
  },
  {} as Record<CustomColourName, PaletteColorOptions>
);

const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
    fontWeightRegular: 600,
  },
  palette: {
    mode: 'dark',
    background: {
      default: brandColours.baedaGrey[800],
    },
    ...customPaletteOptions
  }
});

export default responsiveFontSizes(theme);