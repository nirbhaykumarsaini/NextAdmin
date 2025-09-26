"use client";

import { useEffect, useState, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationLink,
    PaginationNext,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Withdrawal {
    _id: string;
    created_at: string;
    amount: number;
    status: string;
    description?: string;
    user_id: {
        _id: string,
        name: string;
        mobile_number?: string;
    };
}

export default function WithdrawalTable() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/withdrawals`);
            const data = await res.json();

            if (data.status) {
                setWithdrawals(data.data);
            } else {
                toast.error(data.message || "Failed to fetch withdrawals");
            }
        } catch (error) {
            console.error("Error fetching withdrawals:", error);
            toast.error("Error fetching withdrawals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    // ✅ Handle status update (Accept / Reject)
    const handleStatusChange = async (
        withdrawalId: string,
        status: "approved" | "rejected"
    ) => {
        try {
            const res = await fetch(`/api/withdrawals/${withdrawalId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    description:
                        status === "approved"
                            ? "Withdrawal approved by Admin"
                            : "Withdrawal rejected by Admin",
                }),
            });

            const data = await res.json();
            if (data.status) {
                toast.success(`Withdrawal ${status} successfully`);
                fetchWithdrawals(); // refresh list
            } else {
                toast.error(data.message || "Failed to update withdrawal");
            }
        } catch (err) {
            console.error("Error updating withdrawal status:", err);
            toast.error("Error updating withdrawal");
        }
    };

    // Filter withdrawals based on search term
    const filteredWithdrawals = useMemo(() => {
        return withdrawals.filter(withdrawal =>
            withdrawal.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            withdrawal.user_id?.mobile_number?.includes(searchTerm) ||
            withdrawal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            withdrawal.amount.toString().includes(searchTerm) ||
            withdrawal.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [withdrawals, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedWithdrawals = filteredWithdrawals.slice(startIndex, startIndex + itemsPerPage);

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Withdrawals</h2>
                <div className="relative w-full md:w-auto">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search withdrawals..."
                            className="pl-10 w-full md:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S. No.</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
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
                        ) : paginatedWithdrawals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? 'No withdrawals found matching your search' : 'No withdrawals found'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedWithdrawals.map((withdrawal, index) => {
                                const globalIndex = startIndex + index + 1;

                                return (
                                    <TableRow key={withdrawal._id}>
                                        <TableCell className="text-sm">
                                            {globalIndex}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatDate(withdrawal.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Link href={`user-details/?userId=${withdrawal.user_id._id}`}>
                                                    <Avatar className="h-9 w-9 capitalize">
                                                        <AvatarFallback>
                                                            {withdrawal.user_id?.name?.charAt(0) || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </Link>
                                                <Link className="text-blue-500 underline capitalize" href={`user-details/?userId=${withdrawal.user_id._id}`}>
                                                    <div className="font-medium">{withdrawal.user_id?.name}</div>
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {withdrawal.description || "-"}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {withdrawal.user_id?.mobile_number || "-"}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">
                                            {formatCurrency(withdrawal.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    withdrawal.status === "approved"
                                                        ? "default"
                                                        : withdrawal.status === "pending"
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                                className={
                                                    withdrawal.status === "approved"
                                                        ? "bg-green-100 text-green-800"
                                                        : withdrawal.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                }
                                            >
                                                {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                {withdrawal.status === "pending" ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 text-white hover:bg-green-700"
                                                            onClick={() => handleStatusChange(withdrawal._id, "approved")}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleStatusChange(withdrawal._id, "rejected")}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        No Actions
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {!loading && filteredWithdrawals.length > 0 && (
                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredWithdrawals.length)} of {filteredWithdrawals.length} withdrawals
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
        </div>
    );
}