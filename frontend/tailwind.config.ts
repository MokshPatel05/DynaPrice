import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neo-yellow': '#FFE500',
        'neo-pink': '#FF3E6C',
        'neo-lime': '#BFFF00',
        'neo-green': '#00C853',
        'neo-red': '#FF1744',
        'neo-bg': '#F5F0E8',
      },
      fontFamily: {
        space: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'neo': '4px 4px 0px #000000',
        'neo-sm': '2px 2px 0px #000000',
        'neo-lg': '6px 6px 0px #000000',
      },
    },
  },
  plugins: [],
}

export default config
