import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#16211d',
        mist: '#f3f1ea',
        moss: '#6c8b6f',
        pine: '#1f4d43',
        sand: '#d9c6a5',
        slate: '#51606a'
      },
      boxShadow: {
        panel: '0 18px 50px rgba(22, 33, 29, 0.08)'
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at top left, rgba(217, 198, 165, 0.38), transparent 30%), radial-gradient(circle at bottom right, rgba(108, 139, 111, 0.22), transparent 28%)'
      }
    }
  },
  plugins: []
};

export default config;