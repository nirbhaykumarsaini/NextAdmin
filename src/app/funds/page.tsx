"use client"

import React, { useState, useEffect, useMemo } from 'react';
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
import { CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiSearch } from 'react-icons/fi';
import { toast } from 'sonner';
import axios from 'axios';
import { Tabs } from "@/components/ui/tabs";
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Fund {
  _id: string;
  amount: number;
  fund_type: string,
  user_id: {
    _id: string;
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
  const [dataLoading, setDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      setDataLoading(true);
      const response = await axios.get(`/api/funds`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.status) {
        setFunds(response.data.data);
      }
    } catch (error: unknown) {
      console.error('Error fetching funds:', error);
      toast.error('Failed to fetch funds');
    } finally {
      setDataLoading(false);
    }
  };

  // Filter funds based on search term
  const filteredFunds = useMemo(() => {
    return funds.filter(fund =>
      fund.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.fund_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.amount.toString().includes(searchTerm)
    );
  }, [funds, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFunds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFunds = filteredFunds.slice(startIndex, startIndex + itemsPerPage);

  // Generate pagination range (shows limited page numbers)
  const getPaginationRange = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Tabs value="funds" className="space-y-4">
      {/* Funds History Card */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle  className="text-2xl font-bold tracking-tight">Fund History</CardTitle>
            </div>
            <div className="relative w-full md:w-auto">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search funds..."
                  className="pl-10 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataLoading ? (
                    // Loading skeleton
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : funds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No funds found matching your search' : 'No funds found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedFunds.map((fund, index) => {
                      const globalIndex = startIndex + index + 1;

                      return (
                        <TableRow key={fund?._id}>
                          <TableCell className="font-medium">
                            {globalIndex}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatDate(fund.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Link href={`user-details/?userId=${fund?.user_id?._id}`}>
                                <Avatar className="h-9 w-9 capitalize">
                                  <AvatarFallback>
                                    {fund.user_id?.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <Link className="text-blue-500 underline capitalize" href={`user-details/?userId=${fund?.user_id?._id}`}>
                                <div className="font-medium">{fund.user_id?.name}</div>
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {fund.description}
                          </TableCell>
                          <TableCell>
                            {fund.fund_type ? (
                              <Badge>
                                {fund.fund_type}
                              </Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                fund.status === "completed"
                                  ? "default"
                                  : fund.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={
                                fund.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : fund.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {fund.status.charAt(0).toUpperCase() + fund.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className={`${fund.status === 'completed' ? 'text-green-600' :
                            fund.status === 'pending' ? 'text-yellow-800' :
                              'text-red-600'
                            } font-medium`}>
                            {fund.status === 'completed' ? '+' : ''}{formatCurrency(fund.amount)}
                          </TableCell>
                          
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {!dataLoading && filteredFunds.length > 0 && (
              <div className="space-y-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredFunds.length)} of {filteredFunds.length} fund transactions
                </div>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(prev => Math.max(prev - 1, 1));
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {getPaginationRange().map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </>
        </div>
    </Tabs>
  );
};