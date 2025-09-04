"use client"

import React, { useState, useEffect } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Fund {
  _id: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FundsProps {
  userId: string;
  onBalanceUpdate: (newBalance: number) => void;
  currentBalance: number;
}

const Funds: React.FC<FundsProps> = ({ userId, onBalanceUpdate, currentBalance }) => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [fundPagination, setFundPagination] = useState<PaginationData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [fundLoading, setFundLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchFunds(1);
  }, [userId]);

  const fetchFunds = async (page: number = 1) => {
    try {
      setDataLoading(true);
      const response = await axios.get(`/api/funds?page=${page}&limit=10`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        }
      });
      
      if (response.data.status) {
        setFunds(response.data.data.funds);
        setFundPagination(response.data.data.pagination);
      }
    } catch (error: unknown) {
      console.error('Error fetching funds:', error);
      toast.error('Failed to fetch funds');
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
        onBalanceUpdate(response.data.data.newBalance);
        setAmount("");
        setDescription("");
        fetchFunds(1); // Refresh funds list
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

  const renderPagination = () => {
    if (!fundPagination || fundPagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, fundPagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(fundPagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === fundPagination.currentPage}
            onClick={() => fetchFunds(i)}
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
              onClick={() => fetchFunds(fundPagination.currentPage - 1)}
              className={!fundPagination.hasPrev ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {pages}
          <PaginationItem>
            <PaginationNext
              onClick={() => fetchFunds(fundPagination.currentPage + 1)}
              className={!fundPagination.hasNext ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <Tabs value="funds" className="space-y-6">
   

      {/* Funds History Card */}
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No fund transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      funds.map((fund) => (
                        <TableRow key={fund._id}>
                          <TableCell className="font-medium">
                            {formatDate(fund.created_at)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-bold">
                            +{formatCurrency(fund.amount)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {fund.description}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                fund.status === 'completed' ? 'default' : 
                                fund.status === 'pending' ? 'secondary' : 'destructive'
                              }
                              className={
                                fund.status === 'completed' ? 'bg-green-100 text-green-800' :
                                fund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {fund.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {fundPagination && fundPagination.totalCount > 0 && (
                <div className="mt-6">
                  <div className="text-sm text-muted-foreground mb-4">
                    Showing {(fundPagination.currentPage - 1) * 10 + 1} to{' '}
                    {Math.min(fundPagination.currentPage * 10, fundPagination.totalCount)} of{' '}
                    {fundPagination.totalCount} entries
                  </div>
                  {renderPagination()}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Tabs>
  );
};

export default Funds;