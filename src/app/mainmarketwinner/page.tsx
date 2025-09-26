"use client";

import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationLink,
    PaginationNext,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface Winner {
    id: string;
    result_date: string;
    user: string;
    game_name: string;
    game_type: string;
    digit: string;
    panna: string;
    open_panna: string;
    close_panna: string;
    session: string;
    winning_amount: number;
    bid_amount: number;
    created_at: string;
}

export default function MainMarketWinner() {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchWinners();
    }, []);

    const fetchWinners = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/mainmarket/winners');
            const data = await response.json();

            if (data.status) {
                setWinners(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch winners');
            console.error('Error fetching winners:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter winners based on search term
    const filteredWinners = winners.filter(winner =>
        winner.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        winner.game_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        winner.digit.includes(searchTerm) ||
        winner.panna.includes(searchTerm)
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredWinners.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedWinners = filteredWinners.slice(startIndex, startIndex + itemsPerPage);

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Main Market Winners</h2>
                <div className="relative w-full md:w-auto">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users, games, digits..."
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
                            <TableHead>#</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Game</TableHead>
                            <TableHead>Game Type</TableHead>
                            <TableHead>Session</TableHead>
                            <TableHead>Digit</TableHead>
                            <TableHead>Panna</TableHead>
                            <TableHead>Open Panna</TableHead>
                            <TableHead>Close Panna</TableHead>
                            <TableHead>Bid Amount</TableHead>
                            <TableHead>Win Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            // Loading skeleton
                            Array.from({ length: 11 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-9 w-9 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                </TableRow>
                            ))
                        ) : paginatedWinners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? 'No withdrawals found matching your search' : 'No withdrawals found'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedWinners.map((winner, index) => (
                                <TableRow key={winner.id}>
                                    <TableCell className="text-sm">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatDate(winner.result_date)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                    {winner.user.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{winner.user}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {winner.game_name}
                                    </TableCell>
                                    <TableCell className="text-sm capitalize">
                                        {winner.game_type.replace('-', ' ')}
                                    </TableCell>
                                    <TableCell className="text-sm capitalize">
                                        {winner.session || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {winner.digit || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {winner.panna || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {winner.open_panna || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {winner.close_panna || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-green-600">
                                        {formatCurrency(winner.bid_amount)}
                                    </TableCell>
                                    <TableCell className="text-sm font-bold text-green-600">
                                        {formatCurrency(winner.winning_amount)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-sm text-muted-foreground">
                Showing {paginatedWinners.length} of {filteredWinners.length} winners
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

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
    );
}