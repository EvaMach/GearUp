/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
			xs: "480px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
		},
    extend: {
      fontFamily: {
        niramit: ['Niramit', 'sans-serif'],
      },
      colors: {
        primary: '#D4E9DA',
        primaryHighlight: '#c7e7d0',
        accent: '#EF7B6A',
        borderColor: '#b3d9bd',
        bgColor: '#EFFFFE',
        bgDark: "#d1eceb",
        textColor: '#2C352F',
        success: '#58bf9866',
      },
      minWidth: {
        '5': '5rem',
        '15': '15rem',
      },
    },
  },
  plugins: [],
}

