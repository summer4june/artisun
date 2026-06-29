/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  compress: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  async headers() {
    // In development the chunk/asset URLs are stable across rebuilds, so an
    // `immutable` cache makes the browser keep stale JS/CSS forever (code edits
    // never show up without a hard refresh). Only apply long-term caching in
    // production, where filenames are content-hashed.
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/:path*.(js|css)',
          headers: [
            { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          ],
        },
      ];
    }

    return [
      {
        source: '/:path*.mp4',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.(png|jpg|jpeg|webp|glb|svg)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.(js|css)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
