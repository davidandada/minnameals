import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Baeda meal plan',
        short_name: "Baeda",
        description: "Meal plan app to simplify shopping, eating and enjoying",
        start_url: '/',
        display: 'standalone',
        background_color: '#1E283A',
        theme_color: '#1E283A',
        icons: [
            {
                "src": "/images/icon-192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/images/icon-512.png",
                "sizes": "512x512",
                "type": "image/png"
            },
        ],
    }
}