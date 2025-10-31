import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // githubからのアイコン画像を取得
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ycwpuagwratqkojqadpg.supabase.co', // SupabaseのStrageから画像を取得
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinaryから画像を取得(ReadEchoes用)
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
