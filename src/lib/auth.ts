import { NextRequest } from 'next/server'
import { users, User } from './data'

// Simple authentication for demo purposes
// This will be replaced with proper Supabase authentication

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
    // Demo credentials: admin@samarthcaters.com / admin123
    if (email === 'admin@samarthcaters.com' && password === 'admin123') {
        return users[0]
    }
    return null
}

export function generateToken(userId: string): string {
    // Simple token generation for demo
    return btoa(JSON.stringify({ userId, timestamp: Date.now() }))
}

export function verifyToken(token: string): User | null {
    try {
        const decoded = JSON.parse(atob(token))
        const user = users.find(u => u.id === decoded.userId)
        return user || null
    } catch {
        return null
    }
}

export function getCurrentUser(request: NextRequest): User | null {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    return verifyToken(token)
}