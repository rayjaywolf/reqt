import { track } from '@vercel/analytics'

export const trackEvent = (name: string, properties?: Record<string, any>) => {
    track(name, properties)
} 