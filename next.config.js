/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "motobuyers.herosolutions.com.pk",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: false,
  // 👇 ESM fix (important for html-react-parser v5)
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config) => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
      }),
    );
    return config;
  },
};

module.exports = nextConfig;
