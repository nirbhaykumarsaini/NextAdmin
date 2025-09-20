"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, User, Phone, CreditCard, Cpu, Calendar, Shield,
  Plus, Minus, Download, Filter, Search,
  MessageCircle, TrendingUp, TrendingDown, Activity
} from "lucide-react";
import { FaWhatsapp } from 'react-icons/fa'
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Bids from "@/components/BidTables/BidTable";

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
  createdAt: string;
  updatedAt: string;
}

interface Fund {
  _id: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

interface Withdrawal {
  _id: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  user_id: {
    name: string;
    mobile_number: string;
  };
}

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

interface Bid {
  _id: string;
  bid_amount: number;
  created_at: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function UserDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<UserDetails | null>(null);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mainBids, setMainBids] = useState<Bid[]>([]);
  const [starlineBids, setStarlineBids] = useState<Bid[]>([]);
  const [galiBids, setGaliBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundLoading, setFundLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fundPagination, setFundPagination] = useState<PaginationData | null>(null);
  const [withdrawalPagination, setWithdrawalPagination] = useState<PaginationData | null>(null);
  const [transactionPagination, setTransactionPagination] = useState<PaginationData | null>(null);

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || params.id as string;

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
      fetchAllBids(userId); // Fetch all bids for overview
    }
  }, [userId]);

  useEffect(() => {
    if (userId && activeTab) {
      if (activeTab === "overview") {
        // Fetch overview data when switching back to overview tab
        fetchAllBids(userId);
      } else {
        fetchTabData(activeTab);
      }
    }
  }, [userId, activeTab]);

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
        setUser(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch user details");
      }
    } catch (error: unknown) {
      console.error("Error fetching user details:", error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBids = async (userId: string) => {
    try {
      setBidsLoading(true);

      // Fetch bids from all markets
      const [mainResponse, starlineResponse, galiResponse] = await Promise.all([
        axios.get(`/api/mainmarketbid/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        axios.get(`/api/starlinebid/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        axios.get(`/api/galidisawarbid/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ]);

      if (mainResponse.data.status) setMainBids(mainResponse.data.data);
      if (starlineResponse.data.status) setStarlineBids(starlineResponse.data.data);
      if (galiResponse.data.status) setGaliBids(galiResponse.data.data);

      let response;

      response = await axios.get(`/api/users/${userId}/add-fund`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (response.data.status) {
        setFunds(response.data.data.funds);
        setFundPagination(response.data.data.pagination);
      }

      response = await axios.get(`/api/users/${userId}/withdraw`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (response.data.status) {
        setWithdrawals(response.data.data.withdrawals);
        setWithdrawalPagination(response.data.data.pagination);
      }

      response = await axios.get(`/api/users/${userId}/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (response.data.status) {
        setTransactions(response.data.data.transactions);
        setTransactionPagination(response.data.data.pagination);
      }

    } catch (error: unknown) {
      console.error("Error fetching bids:", error);
      toast.error("Failed to fetch bids data");
    } finally {
      setBidsLoading(false);
    }
  };

  const fetchTabData = async (tab: string, page: number = 1) => {
    try {
      setDataLoading(true);
      let response;

      switch (tab) {
        case "funds":
          response = await axios.get(`/api/users/${userId}/add-fund?page=${page}&limit=10`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          });
          if (response.data.status) {
            setFunds(response.data.data.funds);
            setFundPagination(response.data.data.pagination);
          }
          break;

        case "withdrawals":
          response = await axios.get(`/api/users/${userId}/withdraw?page=${page}&limit=10`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          });
          if (response.data.status) {
            setWithdrawals(response.data.data.withdrawals);
            setWithdrawalPagination(response.data.data.pagination);
          }
          break;

        case "transactions":
          response = await axios.get(`/api/users/${userId}/transactions?page=${page}&limit=10`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          });
          if (response.data.status) {
            setTransactions(response.data.data.transactions);
            setTransactionPagination(response.data.data.pagination);
          }
          break;
      }
    } catch (error: unknown) {
      console.error(`Error fetching ${tab}:`, error);
      toast.error(`Failed to fetch ${tab}`);
    } finally {
      setDataLoading(false);
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
        // setUser(prev => prev ? { ...prev, balance: response.data.data.newBalance } : null);
        setAmount("");
        setDescription("");
        fetchTabData("funds", 1);
        fetchTabData("transactions", 1);
        fetchAllBids(userId); // Refresh bids data
         fetchUserDetails(userId)
      } else {
        toast.error(response.data.message);
      }
    } catch (error: unknown) {
      console.error('Add funds error:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message || 'Failed to add funds');
      }
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
        // setUser(prev => prev ? { ...prev, balance: response.data.data.newBalance } : null);
        setAmount("");
        setDescription("");
        fetchTabData("withdrawals", 1);
        fetchTabData("transactions", 1);
        fetchAllBids(userId); // Refresh bids data
        fetchUserDetails(userId)
      } else {
        toast.error(response.data.message);
      }
    } catch (error: unknown) {
      console.error('Withdraw error:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message || 'Failed to withdraw funds');
      }
    } finally {
      setFundLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPhoneForWhatsApp = (phoneNumber: string): string => {
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      if (!cleaned.startsWith('+') && cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      }
    }

    return cleaned;
  };

  // Calculate total amounts for overview
  const totalFunds = funds.reduce((sum, fund) => sum + fund.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  const totalTransactions = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  // Calculate total bid amounts from all markets
  const totalMainBids = mainBids.reduce((sum, bid) => sum + bid.bid_amount, 0);
  const totalStarlineBids = starlineBids.reduce((sum, bid) => sum + bid.bid_amount, 0);
  const totalGaliBids = galiBids.reduce((sum, bid) => sum + bid.bid_amount, 0);
  const totalBidsAmount = totalMainBids + totalStarlineBids + totalGaliBids;

  const renderPagination = (pagination: PaginationData | null, tab: string) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === pagination.currentPage}
            onClick={() => fetchTabData(tab, i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => fetchTabData(tab, pagination.currentPage - 1)}
              className={!pagination.hasPrev ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {pages}
          <PaginationItem>
            <PaginationNext
              onClick={() => fetchTabData(tab, pagination.currentPage + 1)}
              className={!pagination.hasNext ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (loading) {
    return <UserDetailsSkeleton />;
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
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button className="cursor-pointer" variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
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
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Mobile Number</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold pr-3">{user.mobile_number}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-green-50 hover:bg-green-100 cursor-pointer"
                      onClick={() => {
                        const whatsappNumber = formatPhoneForWhatsApp(user.mobile_number);
                        window.open(`https://wa.me/${whatsappNumber}`, '_blank');
                      }}
                      title="Send WhatsApp message"
                    >
                      <FaWhatsapp className="h-4 w-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Balance</p>
                <p className="text-lg font-semibold">{formatCurrency(user.balance)}</p>
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

              {(!user.devices || user.devices.length === 0) && (
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

      {/* Tabs for Funds, Withdrawals, Transactions */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800">
          <TabsTrigger className="cursor-pointer" value="overview">Overview</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="funds">Funds</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="transactions">Transactions</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="bids">Bids</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>Complete overview of user activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Funds */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Total Funds Added</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalFunds)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {funds.length} transactions
                  </p>
                </div>

                {/* Total Withdrawals */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold">Total Withdrawals</h3>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalWithdrawals)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {withdrawals.length} transactions
                  </p>
                </div>

                {/* Total Transactions */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Total Transactions</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalTransactions)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {transactions.length} transactions
                  </p>
                </div>

                {/* Total Bids Amount */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Total Bids Amount</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(totalBidsAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mainBids.length + starlineBids.length + galiBids.length} bids across all markets
                  </p>
                </div>
              </div>

              {/* Market Breakdown */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Main Market Bids</h4>
                  <p className="text-lg font-semibold">{formatCurrency(totalMainBids)}</p>
                  <p className="text-sm text-muted-foreground">{mainBids.length} bids</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Starline Bids</h4>
                  <p className="text-lg font-semibold">{formatCurrency(totalStarlineBids)}</p>
                  <p className="text-sm text-muted-foreground">{starlineBids.length} bids</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Gali Disawar Bids</h4>
                  <p className="text-lg font-semibold">{formatCurrency(totalGaliBids)}</p>
                  <p className="text-sm text-muted-foreground">{galiBids.length} bids</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funds">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Fund History</CardTitle>
              <CardDescription>All fund transactions for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {funds.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No funds found
                          </TableCell>
                        </TableRow>
                      ) : (
                        funds.map((fund) => (
                          <TableRow key={fund._id}>
                            <TableCell>{formatDate(fund.created_at)}</TableCell>
                            <TableCell className="text-green-600 font-medium">
                              +{formatCurrency(fund.amount)}
                            </TableCell>
                            <TableCell>{fund.description}</TableCell>
                            <TableCell>
                              <Badge variant={fund.status === 'completed' ? 'default' : 'secondary'}>
                                {fund.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {renderPagination(fundPagination, "funds")}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>All withdrawal requests for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No withdrawals found
                          </TableCell>
                        </TableRow>
                      ) : (
                        withdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal._id}>
                            <TableCell>{formatDate(withdrawal.created_at)}</TableCell>
                            <TableCell className="text-red-600 font-medium">
                              -{formatCurrency(withdrawal.amount)}
                            </TableCell>
                            <TableCell>{withdrawal.description}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  withdrawal.status === 'completed' ? 'default' :
                                    withdrawal.status === 'pending' ? 'secondary' : 'destructive'
                                }
                              >
                                {withdrawal.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {renderPagination(withdrawalPagination, "withdrawals")}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All transactions for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((transaction) => (
                          <TableRow key={transaction._id}>
                            <TableCell>{formatDate(transaction.created_at)}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell className={
                              transaction.type === 'credit' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                            }>
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              <Badge variant={
                                transaction.status === 'completed' ? 'default' :
                                  transaction.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {renderPagination(transactionPagination, "transactions")}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bids">
          <Bids userId={userId} />
        </TabsContent>

      </Tabs>


    </div>
  );
}

// Skeleton component for loading state
function UserDetailsSkeleton() {
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 bg-white dark:bg-gray-800">
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

        <Card className="lg:col-span-1 bg-white dark:bg-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white dark:bg-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
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

      <Card className="bg-white dark:bg-gray-800">
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

export default function UserDetailsPage() {
  return (
    <Suspense fallback={<UserDetailsSkeleton />}>
      <UserDetailsContent />
    </Suspense>
  );
}