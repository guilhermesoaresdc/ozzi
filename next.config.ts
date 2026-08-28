import type { NextConfig } from 'next'

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://haqcluuzsquoadbikubs.supabase.co').hostname
  } catch {
    return 'placeholder.supabase.co'
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }],
  },
}

export default nextConfig
