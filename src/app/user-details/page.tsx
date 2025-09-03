"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone, CreditCard, Cpu, Calendar, Shield, Plus, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface UserDevice {
  _id: string;
  device_model?: string;
  os?: string;
  browser?: string;
  ip_address?: string;
  last_login: string;
}

interface UserDetails {
  _id: string;
  name: string;
  mobile_number: string;
  balance: number;
  batting: boolean;
  is_blocked: boolean;
  devices: UserDevice[];
  createdAt?: string;
  updatedAt?: string;
}

// Create a component that uses useSearchParams
function UserDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundLoading, setFundLoading] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || params.id as string;

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
  }, [userId]);

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.data.status) {
        setUser(response.data.data || response.data.user);
      } else {
        setError(response.data.message || "Failed to fetch user details");
      }
    } catch (error: unknown) {
      console.error("Error fetching user details:", error);
      if(axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setFundLoading(true);
      const response = await axios.post(`/api/users/${userId}/add-fund`, {
        amount: parseFloat(amount),
        description: description || `Funds added by admin`
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.status) {
        toast.success(response.data.message);
        setUser(prev => prev ? { ...prev, balance: response.data.data.newBalance } : null);
        setAmount("");
        setDescription("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error('Add funds error:', error);
      toast.error(error.response?.data?.message || 'Failed to add funds');
    } finally {
      setFundLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!user || parseFloat(amount) > user.balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setFundLoading(true);
      const response = await axios.post(`/api/users/${userId}/withdraw`, {
        amount: parseFloat(amount),
        description: description || `Funds withdrawn by admin`
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.status) {
        toast.success(response.data.message);
        setUser(prev => prev ? { ...prev, balance: response.data.data.newBalance } : null);
        setAmount("");
        setDescription("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error('Withdraw error:', error);
      toast.error(error.response?.data?.message || 'Failed to withdraw funds');
    } finally {
      setFundLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Back Button Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Info Card Skeleton */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fund Management Skeleton */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </CardContent>
          </Card>

          {/* Devices Card Skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="space-y-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batting Status Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-red-500 text-center">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Button variant="outline" onClick={() => fetchUserDetails(userId)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-muted-foreground">User not found</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic details of the user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-lg font-semibold capitalize">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Mobile Number</p>
                <p className="text-lg font-semibold">{user.mobile_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Balance</p>
                <p className="text-lg font-semibold">₹{user.balance.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={user.is_blocked ? "destructive" : "default"}>
                  {user.is_blocked ? "Blocked" : "Active"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Joined Date</p>
                <p className="text-sm">
                  {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fund Management Card */}
        <Card className="lg:col-span-1 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Fund Management</CardTitle>
            <CardDescription>Add or withdraw funds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                disabled={fundLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Transaction description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={fundLoading}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleAddFunds}
                disabled={fundLoading || !amount || user.is_blocked}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={fundLoading || !amount || user.is_blocked || parseFloat(amount) > user.balance}
                variant="destructive"
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
            
            {user.is_blocked && (
              <p className="text-sm text-red-500 text-center">
                Cannot manage funds for blocked users
              </p>
            )}
          </CardContent>
        </Card>

        {/* Devices Card */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Devices ({user.devices?.length || 0})</CardTitle>
            <CardDescription>Devices used by this user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.devices?.map((device, index) => (
                <div key={device._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Device {index + 1}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Model: </span>
                          {device.device_model || "Unknown"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">OS: </span>
                          {device.os || "Unknown"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Browser: </span>
                          {device.browser || "Unknown"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">IP: </span>
                          {device.ip_address || "Unknown"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Last login: {formatDate(device.last_login)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {!user.devices || user.devices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No devices found for this user
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batting Status Card */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Batting Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={user.batting ? "default" : "secondary"}>
            {user.batting ? "Active" : "Inactive"}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            This user is currently {user.batting ? "actively" : "not"} betting on the platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main export with Suspense boundary
export default function UserDetailsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Info Card Skeleton */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Fund Management Skeleton */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          ))}
          <div className="flex gap-2">
            <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Devices Card Skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Batting Status Card Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>}>
      <UserDetailsContent />
    </Suspense>
  );
}