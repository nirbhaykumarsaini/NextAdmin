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
  fund_type: string,
  user_id: {
    name: string;
  }
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



export default function Funds() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [fundPagination, setFundPagination] = useState<PaginationData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);


  useEffect(() => {
    fetchFunds(1);
  }, []);

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

  const handleStatusChange = async (
    fund_id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const res = await fetch(`/api/add-fund/${fund_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          description:
            status === "approved"
              ? "Fund approved by Admin"
              : "Fund rejected by Admin",
        }),
      });

      const data = await res.json();
      if (data.status) {
        toast.success(`Fund ${status} successfully`);
        fetchFunds(); // refresh list
      } else {
        toast.error(data.message || "Failed to update fund");
      }
    } catch (err) {
      console.error("Error updating fund status:", err);
      toast.error("Error updating fund");
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
    const endPage = Math.min(fundPagination.totalPages, startPage + maxVisiblePages - 1);

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
                      <TableHead>#</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
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
                      funds.map((fund, index) => (
                        <TableRow key={fund._id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatDate(fund.created_at)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {fund.user_id.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {fund.description}
                          </TableCell>
                          <TableCell>
                           {fund.fund_type ? <Badge>
                              {fund.fund_type}
                            </Badge> : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                fund.status === "approved"
                                  ? "default"
                                  : fund.status === "pending"
                                    ? "secondary"
                                    : "outline"
                              }
                              className={
                                fund.status === "approved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : fund.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }
                            >
                              {fund.status}
                            </Badge>
                          </TableCell>
                          <TableCell className={` ${fund.status === 'approved' ? ' text-green-600' :
                            fund.status === 'pending' ? ' text-yellow-800' :
                              ' text-red-600'
                            } font-medium`}>
                            {fund.status === 'approved' ? ' +' : ''}{formatCurrency(fund.amount)}
                          </TableCell>

                          <TableCell className="space-x-2">
                            {fund.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 text-white hover:bg-green-700"
                                  onClick={() => handleStatusChange(fund._id, "approved")}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStatusChange(fund._id, "rejected")}
                                >
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                No Actions
                              </span>
                            )}
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

