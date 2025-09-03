"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {  FiShield, FiUser, FiArrowLeft } from 'react-icons/fi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import { LoginResponse, User } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      toast.success('Profile loaded successfully');
    } catch (err: unknown) {
      let errorMessage = 'Failed to fetch profile';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
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
          {/* <Button variant="outline" size="sm" className="gap-2">
            <FiEdit className="h-4 w-4" />
            Edit Profile
          </Button> */}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4  rounded-lg bg-white dark:bg-gray-800">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={`/api/avatar/${user.username}`} />
              <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left ">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
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