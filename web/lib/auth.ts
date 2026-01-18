import { User } from '@/types';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAuthenticated') === 'true';
}

export function clearAuthData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('isAuthenticated');
}

export function hasPermission(permission: string): boolean {
  const user = getStoredUser();
  if (!user) return false;
  
  return user.permissions?.includes(permission) || false;
}

export function hasGroup(group: string): boolean {
  const user = getStoredUser();
  if (!user) return false;
  
  return user.groups?.includes(group) || false;
}

export function isAdmin(): boolean {
  return hasGroup('admin') || hasGroup('superadmin');
}
