'use client';
import { createTheme, PaletteColor, PaletteColorOptions, responsiveFontSizes } from '@mui/material/styles';
import brandColours from './colours';

type CustomColorName = keyof typeof brandColours;

declare module '@mui/material/styles' {
  interface Palette extends Record<CustomColorName, PaletteColor> { }
  interface PaletteOptions extends Partial<Record<CustomColorName, PaletteColorOptions>> { }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides extends Record<CustomColorName, true> { }
}
declare module '@mui/material/TextField' {
  interface TextFieldPropsColorOverrides extends Record<CustomColorName, true> { }
}

declare module '@mui/material/CircularProgress' {
  interface CircularProgressPropsColorOverrides extends Record<CustomColorName, true> { }
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides extends Record<CustomColorName, true> { }
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides extends Record<CustomColorName, true> { }
}

// Light-background palette colours need dark text to meet WCAG AA contrast.
// Dark-background colours (red, grey) keep white text.
const contrastTextMap: Partial<Record<CustomColorName, string>> = {
  baedaYellow: '#1a1a1a',
  baedaGreen:  '#1a1a1a',
  baedaOrange: '#1a1a1a',
  baedaPink:   '#1a1a1a',
  baedaBlue:   '#1a1a1a',
};

const customPaletteOptions = Object.entries(brandColours).reduce(
  (acc, [colorName, colorScale]) => {
    acc[colorName as CustomColorName] = {
      main: colorScale[500],
      light: colorScale[300],
      dark: colorScale[700],
      contrastText: contrastTextMap[colorName as CustomColorName] ?? '#ffffff',
      ...colorScale,
    };
    return acc;
  },
  {} as Record<CustomColorName, PaletteColorOptions>
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