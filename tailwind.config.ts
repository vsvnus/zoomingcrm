import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			'bg-primary': 'rgb(var(--bg-primary) / <alpha-value>)',
  			'bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
  			'bg-tertiary': 'rgb(var(--bg-tertiary) / <alpha-value>)',
  			'bg-hover': 'rgb(var(--bg-hover) / <alpha-value>)',
  			'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
  			'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
  			'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
  			'text-quaternary': 'rgb(var(--text-quaternary) / <alpha-value>)',
  			accent: {
  				'50': 'rgb(var(--accent-50) / <alpha-value>)',
  				'100': 'rgb(var(--accent-100) / <alpha-value>)',
  				'200': 'rgb(var(--accent-200) / <alpha-value>)',
  				'300': 'rgb(var(--accent-300) / <alpha-value>)',
  				'400': 'rgb(var(--accent-400) / <alpha-value>)',
  				'500': 'rgb(var(--accent-500) / <alpha-value>)',
  				'600': 'rgb(var(--accent-600) / <alpha-value>)',
  				'700': 'rgb(var(--accent-700) / <alpha-value>)',
  				'800': 'rgb(var(--accent-800) / <alpha-value>)',
  				'900': 'rgb(var(--accent-900) / <alpha-value>)',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			success: 'rgb(var(--success) / <alpha-value>)',
  			'success-bg': 'rgb(var(--success-bg) / <alpha-value>)',
  			'success-border': 'rgb(var(--success-border) / <alpha-value>)',
  			warning: 'rgb(var(--warning) / <alpha-value>)',
  			'warning-bg': 'rgb(var(--warning-bg) / <alpha-value>)',
  			'warning-border': 'rgb(var(--warning-border) / <alpha-value>)',
  			error: 'rgb(var(--error) / <alpha-value>)',
  			'error-bg': 'rgb(var(--error-bg) / <alpha-value>)',
  			'error-border': 'rgb(var(--error-border) / <alpha-value>)',
  			info: 'rgb(var(--info) / <alpha-value>)',
  			'info-bg': 'rgb(var(--info-bg) / <alpha-value>)',
  			'info-border': 'rgb(var(--info-border) / <alpha-value>)',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			xs: 'var(--radius-xs)',
  			sm: 'calc(var(--radius) - 4px)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'var(--radius-2xl)',
  			full: 'var(--radius-full)'
  		},
  		spacing: {
  			'1': 'var(--space-1)',
  			'2': 'var(--space-2)',
  			'3': 'var(--space-3)',
  			'4': 'var(--space-4)',
  			'5': 'var(--space-5)',
  			'6': 'var(--space-6)',
  			'8': 'var(--space-8)',
  			'10': 'var(--space-10)',
  			'12': 'var(--space-12)',
  			'16': 'var(--space-16)'
  		},
  		boxShadow: {
  			'1': 'var(--shadow-1)',
  			'2': 'var(--shadow-2)',
  			'3': 'var(--shadow-3)',
  			'4': 'var(--shadow-4)',
  			glow: 'var(--shadow-glow)'
  		},
  		transitionDuration: {
  			fast: 'var(--timing-fast)',
  			base: 'var(--timing-base)',
  			slow: 'var(--timing-slow)',
  			slower: 'var(--timing-slower)'
  		},
  		keyframes: {
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			'fade-in-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					transform: 'translateY(100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'slide-down': {
  				'0%': {
  					transform: 'translateY(-100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			}
  		},
  		animation: {
  			'fade-in': 'fade-in var(--timing-base) ease-out',
  			'fade-in-up': 'fade-in-up var(--timing-slow) ease-out',
  			'scale-in': 'scale-in var(--timing-base) ease-out',
  			'slide-up': 'slide-up var(--timing-slower) cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'slide-down': 'slide-down var(--timing-slow) ease-out'
  		}
  	}
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
      require("tailwindcss-animate")
],
}

export default config
