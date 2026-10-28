/** Design tokens taken from the "Warm Editorial Minimalism" design system. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8f5f0', surface: '#f8f5f0', 'surface-dim': '#dcdad5', 'surface-bright': '#f8f5f0',
        'surface-container-lowest': '#ffffff', 'surface-container-low': '#f6f3ee', 'surface-container': '#f0ede9',
        'surface-container-high': '#ebe8e3', 'surface-container-highest': '#e5e2dd', 'surface-variant': '#e5e2dd',
        'on-surface': '#1c1c19', 'on-background': '#1c1c19', 'on-surface-variant': '#4e4541',
        'inverse-surface': '#31302d', 'inverse-on-surface': '#f3f0eb', 'inverse-primary': '#d5c3bb',
        sand: '#efe9dd',
        outline: '#807570', 'outline-variant': '#d1c4be', 'surface-tint': '#695c56',
        primary: '#221914', 'on-primary': '#ffffff', 'primary-container': '#382d28', 'on-primary-container': '#a4948d',
        secondary: '#705a4a', 'on-secondary': '#ffffff', 'secondary-container': '#f8dac6', 'on-secondary-container': '#755e4e',
        tertiary: '#21190f', 'tertiary-container': '#372e22',
        error: '#ba1a1a', 'on-error': '#ffffff', 'error-container': '#ffdad6', 'on-error-container': '#93000a',
        'primary-fixed': '#f2dfd7', 'secondary-fixed': '#fbddc9', 'on-secondary-fixed': '#28180c',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.1em', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '500' }],
        'body-md': ['14px', { lineHeight: '22px', letterSpacing: '0.01em' }],
        'body-lg': ['16px', { lineHeight: '26px' }],
        'title-md': ['15px', { lineHeight: '22px', fontWeight: '500' }],
        'title-lg': ['18px', { lineHeight: '26px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'headline-sm': ['22px', { lineHeight: '30px', letterSpacing: '0.01em' }],
        'headline-md': ['28px', { lineHeight: '36px' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px' }],
        'headline-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.01em' }],
        'display-mobile': ['36px', { lineHeight: '44px', letterSpacing: '-0.01em' }],
        display: ['56px', { lineHeight: '64px', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        soft: '0 16px 36px -12px rgba(56,45,40,0.06), 0 4px 12px -2px rgba(56,45,40,0.03)',
        drawer: '0 16px 36px -12px rgba(56,45,40,0.18)',
      },
    },
  },
  plugins: [],
};
