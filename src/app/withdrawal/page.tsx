"use client";

import { useEffect, useState } from "react";
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

interface Withdrawal {
    _id: string;
    created_at: string;
    amount: number;
    status: string;
    description?: string;
    user_id: {
        name: string;
        mobile_number?: string;
    };
}

export default function WithdrawalTable() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch(`/api/withdrawals`); // ✅ Your GET all withdrawals API
            const data = await res.json();

            if (data.status) {
                setWithdrawals(data.data);
            }
        } catch (error) {
            console.error("Error fetching withdrawals:", error);
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
                alert(`Withdrawal ${status} successfully`);
                fetchWithdrawals(); // refresh list
            } else {
                alert(data.message || "Failed to update withdrawal");
            }
        } catch (err) {
            console.error("Error updating withdrawal status:", err);
            alert("Error updating withdrawal");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",  // or "long" for full month name
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // ensures AM/PM format
        });
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
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : withdrawals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    No withdrawals found
                                </TableCell>
                            </TableRow>
                        ) : (
                            withdrawals.map((w,index) => (
                                <TableRow key={w._id}>
                                    <TableCell className="text-sm">
                                        {index+1}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatDate(w.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>
                                                    {w.user_id?.name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{w.user_id?.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {w.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {w.user_id?.mobile_number || "-"}
                                    </TableCell>
                                    <TableCell className="text-sm">₹{w.amount}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                w.status === "approved"
                                                    ? "default"
                                                    : w.status === "pending"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                            className={
                                                w.status === "approved"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : w.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                            }
                                        >
                                            {w.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {w.status === "pending" ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 text-white hover:bg-green-700"
                                                    onClick={() => handleStatusChange(w._id, "approved")}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleStatusChange(w._id, "rejected")}
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

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive>
                            1
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
