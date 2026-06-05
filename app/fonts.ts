import localFont from 'next/font/local';

export const ppEditorialNew = localFont({
  src: '../public/fonts/PPEditorialNew-Regular-BF644b214ff145f.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-editorial',
  fallback: ['Georgia', 'serif'],
  display: 'swap',
});

export const suisseIntl = localFont({
  src: [
    {
      path: '../public/fonts/SuisseIntl-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SuisseIntl_Medium.ttf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-suisse',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
  display: 'swap',
});
