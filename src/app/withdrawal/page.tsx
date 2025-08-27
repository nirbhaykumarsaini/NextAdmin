"use client";

import { FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
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

const usersData = [
    {
        id: 1,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "John Doe",
        username: "johndoe",
        avatar: "",
        status: "Active",
    },
    {
        id: 2,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "Jane Smith",
        username: "janesmith",
        avatar: "",
        status: "Active",
    },
    {
        id: 3,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "Robert Johnson",
        username: "robertj",
        avatar: "",
        status: "Inactive",
    },
    {
        id: 4,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "Emily Davis",
        username: "emilyd",
        avatar: "",
        status: "Active",
    },
    {
        id: 5,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "Michael Wilson",
        username: "michaelw",
        avatar: "",
        status: "Active",
    },
    {
        id: 6,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "Sarah Thompson",
        username: "sarah",
        avatar: "",
        status: "Inactive",
    },
    {
        id: 7,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "David Lee",
        username: "davidl",
        avatar: "",
        status: "Active",
    },
    {
        id: 8,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "Jennifer Brown",
        username: "jennifer",
        avatar: "",
        status: "Active",
    },
    {
        id: 9,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "Thomas Anderson",
        username: "thomas",
        avatar: "",
        status: "Active",
    },
    {
        id: 10,
        date:"Aug 17, 2025",
        method:"paytm",
        number:9876543210,
        name: "Lisa Wong",
        username: "lisaw",
        avatar: "",
        status: "Inactive",
    }
];

export default function Withdrawal() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Withdrawal</h2>
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
                            <TableHead>Method</TableHead>
                            <TableHead>Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                    {user.method}
                                </TableCell>
                                    <TableCell className="text-sm">
                                    {user.number}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.status === 'Active' ? 'default' : 'secondary'}
                                        className={user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                                    >
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                                        <FiEdit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                                        <FiTrash2 className="h-4 w-4" />
                                    </Button>
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