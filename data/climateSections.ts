export interface SectionData {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
}

export const sections: SectionData[] = [
  {
    id: 'sec-1',
    badge: 'CLIMATE 01',
    title: 'SHIMLA',
    description: 'In Shimla, your skin feels dry, tight and flaky.',
    ctaText: 'Explore',
    mediaUrl: '/climate/shimla.mp4',
    mediaType: 'video',
  },
  {
    id: 'sec-2',
    badge: 'CLIMATE 02',
    title: 'JAIPUR',
    description: 'In Jaipur, the very same skin turns oily, sticky and pigmented.',
    ctaText: 'Explore',
    mediaUrl: '/climate/jaipur.mp4',
    mediaType: 'video',
  },
  {
    id: 'sec-3',
    badge: 'CLIMATE 03',
    title: 'BANGALORE',
    description: 'Bangalore’s heat and humidity cling to you all day.',
    ctaText: 'Explore',
    mediaUrl: '/climate/banglore.mp4',
    mediaType: 'video',
  },
  {
    id: 'sec-4',
    badge: 'CLIMATE 04',
    title: 'MUMBAI',
    description: 'While sudden showers in Mumbai make it greasy and unpredictable.',
    ctaText: 'Explore',
    mediaUrl: '/climate/mumbai.mp4',
    mediaType: 'video',
  },
  {
    id: 'sec-5',
    badge: 'CONSTANT',
    title: 'IMAGE_LOGO',
    description: 'And through all these climates, the sun never leaves your side.',
    ctaText: 'Discover',
    mediaUrl: '/beautiful-sunset-ocean-horizon-with-sun-shining-through-large-clouds.jpg',
    mediaType: 'image',
  }
];
