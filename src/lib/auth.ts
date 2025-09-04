import { NextRequest } from 'next/server';
import { sql } from './database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  username: string;
  email?: string;
  created_at: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(username: string, password: string, email?: string): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existingUser.length > 0) {
      return { success: false, error: 'Username already exists' };
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    const newUser = await sql`
      INSERT INTO users (id, username, password, email, created_at)
      VALUES (${userId}, ${username}, ${hashedPassword}, ${email || null}, NOW())
      RETURNING id, username, email, created_at
    `;

    const user = newUser[0] as User;
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { success: true, user, token };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function authenticateUser(username: string, password: string): Promise<AuthResult> {
  try {
    const users = await sql`
      SELECT id, username, password, email, created_at FROM users WHERE username = ${username}
    `;

    if (users.length === 0) {
      return { success: false, error: 'Invalid credentials' };
    }

    const user = users[0];
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }, 
      token 
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export async function verifyToken(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    
    const users = await sql`
      SELECT id, username, email, created_at FROM users WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      return { valid: false, error: 'User not found' };
    }

    const user = users[0] as User;
    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return null;
    }

    const result = await verifyToken(token);
    return result.valid ? result.user || null : null;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}
