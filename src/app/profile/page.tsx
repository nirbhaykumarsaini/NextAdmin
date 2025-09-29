"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FiShield, FiUser, FiArrowLeft, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import { LoginResponse, User } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<LoginResponse>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      const result = response.data;

      if (!result.status) {
        throw new Error(result.message || 'Failed to fetch profile');
      }

      setUser(result.user);
    } catch (err: unknown) {
      let errorMessage = 'Failed to fetch profile';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      toast.error('All fields are required');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New password and confirmation do not match');
      return;
    }

    if (passwordForm.old_password === passwordForm.new_password) {
      toast.error('New password must be different from old password');
      return;
    }

    // Password strength validation (optional)
    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await axios.put('/api/auth/change-password', passwordForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      const result = response.data;

      if (result.status) {
        toast.success('Password changed successfully');
        setIsChangePasswordOpen(false);
        setPasswordForm({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        toast.error(result.message || 'Failed to change password');
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to change password';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || 'Failed to change password';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className='bg-white dark:bg-gray-800'>
          <CardHeader className='flex justify-between'>
            <div className='space-y-2'>
              <Skeleton className="h-8 w-48 bg-white dark:bg-gray-900" />
              <Skeleton className="h-4 w-64 bg-white dark:bg-gray-900" />
            </div>
            <div>
              <Skeleton className="h-6 w-32 bg-white dark:bg-gray-900" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full bg-white dark:bg-gray-900" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-white dark:bg-gray-900" />
                <Skeleton className="h-4 w-24 bg-white dark:bg-gray-900" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-64 w-full bg-white dark:bg-gray-900" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-destructive mb-4">
              <FiShield className="h-12 w-12 mx-auto mb-2" />
              <p className="font-semibold">Error loading profile</p>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchUserProfile}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className='bg-white dark:bg-gray-800'>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground mb-4">
              <FiUser className="h-12 w-12 mx-auto mb-2" />
              <p className="font-semibold">No user data found</p>
            </div>
            <p>Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 gap-2"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className='bg-white dark:bg-gray-900'>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </div>

          {/* Change Password Button */}
          <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FiLock className="h-4 w-4" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and set a new one.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handlePasswordChange} className="space-y-4 py-4 ">
                <div className="space-y-2">
                  <Label htmlFor="old_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="old_password"
                      name="old_password"
                      type={showOldPassword ? "text" : "password"}
                      value={passwordForm.old_password}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <FiEyeOff className="h-4 w-4" />
                      ) : (
                        <FiEye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      name="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <FiEyeOff className="h-4 w-4" />
                      ) : (
                        <FiEye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-4 w-4" />
                      ) : (
                        <FiEye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsChangePasswordOpen(false)}
                    disabled={isChangingPassword}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-white dark:bg-gray-800">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={`/api/avatar/${user.username}`} />
              <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold capitalize">{user.username}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className={user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                >
                  <FiShield className="h-3 w-3 mr-1" />
                  {user.role?.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className='bg-white dark:bg-gray-800'>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FiUser className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="font-mono text-sm text-muted-foreground">{user._id}</p>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white dark:bg-gray-800'>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FiShield className="h-5 w-5" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="font-medium text-green-600">Active</p>
                </div>

              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;