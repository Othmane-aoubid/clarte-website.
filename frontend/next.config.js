// Source - https://stackoverflow.com/a/79964779
// Posted by Siddiqui Noor
// Retrieved 2026-07-16, License - CC BY-SA 4.0

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Key for Next.js 15
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
