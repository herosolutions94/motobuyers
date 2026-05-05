/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  images: {
    domains: ['localhost', 'localhost:8080', '127.0.0.1','motobuyers.herosolutions.com.pk'],
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
