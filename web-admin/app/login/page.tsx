"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { apiService } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError('');

    try {
      console.log('Attempting admin login...');
      const response = await apiService.login(formData.email, formData.password);
      console.log('Login response:', response);
      
      if (response.status === 'success') {
        const user = response.data.user;
        console.log('User data:', user);
        console.log('User groups:', user.groups);
        
        // Check if user has admin/superadmin role
        if (!user.groups?.includes('admin') && !user.groups?.includes('superadmin')) {
          console.error('User not authorized - groups:', user.groups);
          setLoginError('You are not authorized to access the admin panel');
          setIsLoading(false);
          return;
        }
        
        console.log('Authorization check passed, storing data...');
        
        // Store admin user data and set cookie
        localStorage.setItem('admin_user', JSON.stringify(user));
        localStorage.setItem('isAdminAuthenticated', 'true');
        
        // Set cookie for middleware (expires in 30 days)
        const token = response.data.token;
        console.log('Setting cookie with token:', token ? 'Token exists' : 'No token!');
        document.cookie = `admin_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        
        console.log('Cookie set, redirecting to /admin/users');
        router.push('/admin/users');
      } else {
        console.error('Login failed with response:', response);
        setLoginError(response.message || 'Invalid email or password');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to access the admin panel';
      } else if (error.response?.data?.messages?.error) {
        errorMessage = error.response.data.messages.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CPC Admin</h1>
          <p className="text-gray-600 mt-2">Administration Panel</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Sign in to manage the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                  className={errors.email ? 'border-red-500' : ''}
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in to Admin Panel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
