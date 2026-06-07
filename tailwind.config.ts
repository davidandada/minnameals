import type { Config } from 'tailwindcss'
import brandColours from './src/styles/colours'

export default {
  theme: {
    extend: {
      colors: {
        ...brandColours
      }
    }
  }
} satisfies Config;