/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.FEACO_AFFILIATIONS_QA === "1" ? ".next-affiliations-qa" : process.env.FEACO_TERRITORY_QA === "1" ? ".next-territory-qa-webpack" : ".next-feaco",
  experimental: { cpus: 2 },
  serverExternalPackages: ["googleapis"],
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
