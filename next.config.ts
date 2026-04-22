import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
webpack(config, { isServer }) {
		if (!isServer) {
			const cacheGroups = config.optimization?.splitChunks?.cacheGroups ?? {}
			config.optimization = {
				...config.optimization,
				splitChunks: {
					...config.optimization?.splitChunks,
					cacheGroups: {
						...cacheGroups,
						three: {
							test: /node_modules[\\/]three/,
							name: 'three',
							chunks: 'all' as const,
						},
						gsap: {
							test: /node_modules[\\/]gsap/,
							name: 'gsap',
							chunks: 'all' as const,
						},
					},
				},
			}
		}
		return config
	},
}

export default nextConfig
