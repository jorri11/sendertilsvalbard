/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte}'],
  theme: {
    extend: {
      colors: {
        polar: '#06131f',
        night: '#0b1020',
        ice: '#d9fbff',
        aurora: '#66ffcc',
        violet: '#8f7cff',
        ember: '#ffb86b',
        rose: '#ff6f91'
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 40px rgba(102, 255, 204, 0.18)'
      }
    }
  },
  plugins: []
};
