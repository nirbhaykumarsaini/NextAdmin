"use client";

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

const usersData = [
    {
        id: 1,
        date: "Aug 17, 2025",
        game: "Night Day",
        gameType: "single-digit",
        digit: 12,
        winamount: 200,
        method: "paytm",
        number: 9876543210,
        name: "John Doe",
        username: "johndoe",
        avatar: "",
    },
    {
        id: 2,
        date: "Aug 17, 2025",
        game: "Night Day",
        gameType: "single-digit",
        digit: 12,
        winamount: 200,
        method: "paytm",
        number: 9876543210,
        name: "Jane Smith",
        username: "janesmith",
        avatar: "",
        status: "Active",
    },
    {
        id: 3,
        date: "Aug 17, 2025",
        game: "Night Day",
        gameType: "single-digit",
        digit: 12,
        winamount: 200,
        method: "paytm",
        number: 9876543210,
        name: "Robert Johnson",
        username: "robertj",
        avatar: "",
        status: "Inactive",
    },
    {
        id: 4,
        date: "Aug 17, 2025",
        game: "Night Day",
        gameType: "single-digit",
        digit: 12,
        winamount: 200,
        method: "paytm",
        number: 9876543210,
        name: "Emily Davis",
        username: "emilyd",
        avatar: "",
        status: "Active",
    },
    {
        id: 5,
        date: "Aug 17, 2025",
        game: "Night Day",
        gameType: "single-digit",
        digit: 12,
        winamount: 200,
        method: "paytm",
        number: 9876543210,
        name: "Michael Wilson",
        username: "michaelw",
        avatar: "",
        status: "Active",
    },
    {
        id: 6,
        date: "Aug 17, 2025",
        game: "Night Day",
        gameType: "single-digit",
        digit: 12,
        winamount: 200,
        method: "paytm",
        number: 9876543210,
        name: "Sarah Thompson",
        username: "sarah",
        avatar: "",
        status: "Inactive",
    },
    {
        id: 7,
        date: "Aug 17, 2025",
        game: "Night Day",
        gameType: "single-digit",
        digit: 12,
        winamount: 200,
        method: "paytm",
        number: 9876543210,
        name: "David Lee",
        username: "davidl",
        avatar: "",
        status: "Active",
    },
    {
        id: 8,
        date: "Aug 17, 2025",
        game: "Night Day",
        gameType: "single-digit",
        digit: 12,
        winamount: 200,
        method: "paytm",
        number: 9876543210,
        name: "Jennifer Brown",
        username: "jennifer",
        avatar: "",
        status: "Active",
    },
  
];

export default function GalidisawarWinner() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Galidisawar Winner</h2>
                <div className="relative w-full md:w-auto">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10 w-full md:w-[300px]"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Game</TableHead>
                            <TableHead>Game Type</TableHead>
                            <TableHead>Digit</TableHead>
                            <TableHead>Bid Amount</TableHead>
                            <TableHead>Win Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usersData.map((user) => (

                            <TableRow key={user.id}>
                                <TableCell className="text-sm">
                                    {user.date}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>
                                                {user.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                @{user.username}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {user.game}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {user.gameType}
                                </TableCell>
                                <TableCell>
                                   {user.digit}
                                </TableCell>
                                  <TableCell>
                                   {user.digit}
                                </TableCell>
                                  <TableCell>
                                   {user.winamount}
                                </TableCell>
                            </TableRow>
                        ))}
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
                        <PaginationLink href="#">
                            2
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">
                            3
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}