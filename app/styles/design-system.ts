export const colors = {
  // Primary colors
  rivalGreen: '#9BEE29', // Bright green from logo
  black: '#000000',
  white: '#FFFFFF',
  cream: '#F8F3E8', // Beige background from screenshot
  
  // Accent colors
  yellow: '#FFC700',
  red: '#FF3B30',
  blue: '#1C99EB',
  
  // UI colors
  lightGrey: '#F2F2F2',
  mediumGrey: '#D1D1D1',
  darkGrey: '#8E8E8E',
}

export const gradients = {
  greenGradient: 'linear-gradient(90deg, #9BEE29 0%, #76B406 100%)',
  yellowGradient: 'linear-gradient(90deg, #FFC700 0%, #F7A800 100%)',
}

export const fonts = {
  rival: {
    family: '"Cooper Black", serif',
    weight: 'heavy',
    size: {
      logo: '110px',
      h1: '3.5rem',
      h2: '2.5rem',
    },
  },
  sports: {
    family: '"Helvetica Neue", sans-serif',
    weight: 'bold',
    letterSpacing: '-0.05em',
    size: {
      logo: '72px',
      h3: '1.5rem',
      h4: '1.25rem',
    },
  },
  body: {
    family: '"Helvetica Neue", "Inter", sans-serif',
    weight: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    },
  },
}

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
}

export const borders = {
  thin: '1px solid black',
  medium: '2px solid black',
  thick: '3px solid black',
  thickest: '5px solid black',
  radius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    round: '9999px',
  },
}

export const shadows = {
  small: '2px 2px 0px rgba(0, 0, 0, 0.8)',
  medium: '4px 4px 0px rgba(0, 0, 0, 0.8)',
  large: '6px 6px 0px rgba(0, 0, 0, 0.8)',
}

export const animations = {
  bounce: 'bounce 0.4s ease-in-out',
  pulse: 'pulse 1.5s ease-in-out infinite',
  wobble: 'wobble 0.8s ease-in-out',
}

// CPFM-inspired styling helpers
export const cpfmStyles = {
  buttonBase: `
    font-bold uppercase 
    border-3 border-black 
    shadow-[4px_4px_0px_rgba(0,0,0,0.8)] 
    transform transition-transform duration-200 
    hover:translate-y-[-2px] hover:shadow-[4px_6px_0px_rgba(0,0,0,0.8)] 
    active:translate-y-[2px] active:shadow-[4px_2px_0px_rgba(0,0,0,0.8)]
  `,
  cardBase: `
    bg-white border-3 border-black rounded-xl 
    shadow-[5px_5px_0px_rgba(0,0,0,0.8)]
    overflow-hidden
  `,
  smileyFace: `
    bg-[#9BEE29] rounded-full border-3 border-black flex items-center justify-center
    before:content-['"◕‿◕"'] before:rotate-90 before:text-black before:font-bold
  `,
} 