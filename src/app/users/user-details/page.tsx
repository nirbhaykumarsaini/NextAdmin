// C:\Users\User\OneDrive\Desktop\nextadmin\src\app\users\user-details\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, CreditCard, Cpu, Globe, Calendar, Shield } from "lucide-react";

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

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchUserDetails(params.id as string);
    }
  }, [params.id]);

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.data.status) {
        setUser(response.data.data);
      } else {
        setError("Failed to fetch user details");
      }
    } catch (error: any) {
      if(error instanceof Error){
        setError(error?.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p>User not found</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="md:col-span-1">
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

        {/* Devices Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Devices ({user.devices.length})</CardTitle>
            <CardDescription>Devices used by this user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.devices.map((device, index) => (
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
              
              {user.devices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No devices found for this user
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batting Status Card */}
      <Card>
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