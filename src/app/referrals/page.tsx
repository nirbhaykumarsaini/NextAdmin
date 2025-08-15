"use client";

import { FiEdit, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    avatar: "",
    status: "Active",
    role: "Admin",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "janesmith",
    email: "jane@example.com",
    avatar: "",
    status: "Active",
    role: "Editor",
    lastActive: "5 hours ago"
  },
  {
    id: 3,
    name: "Robert Johnson",
    username: "robertj",
    email: "robert@example.com",
    avatar: "",
    status: "Inactive",
    role: "Viewer",
    lastActive: "2 days ago"
  },
  {
    id: 4,
    name: "Emily Davis",
    username: "emilyd",
    email: "emily@example.com",
    avatar: "",
    status: "Active",
    role: "Editor",
    lastActive: "1 hour ago"
  },
  {
    id: 5,
    name: "Michael Wilson",
    username: "michaelw",
    email: "michael@example.com",
    avatar: "",
    status: "Active",
    role: "Admin",
    lastActive: "30 minutes ago"
  },
  {
    id: 6,
    name: "Sarah Thompson",
    username: "sarah",
    email: "sarah@example.com",
    avatar: "",
    status: "Inactive",
    role: "Viewer",
    lastActive: "1 week ago"
  },
  {
    id: 7,
    name: "David Lee",
    username: "davidl",
    email: "david@example.com",
    avatar: "",
    status: "Active",
    role: "Editor",
    lastActive: "3 hours ago"
  },
  {
    id: 8,
    name: "Jennifer Brown",
    username: "jennifer",
    email: "jennifer@example.com",
    avatar: "",
    status: "Active",
    role: "Viewer",
    lastActive: "Yesterday"
  },
  {
    id: 9,
    name: "Thomas Anderson",
    username: "thomas",
    email: "thomas@example.com",
    avatar: "",
    status: "Active",
    role: "Admin",
    lastActive: "45 minutes ago"
  },
  {
    id: 10,
    name: "Lisa Wong",
    username: "lisaw",
    email: "lisa@example.com",
    avatar: "",
    status: "Inactive",
    role: "Viewer",
    lastActive: "2 weeks ago"
  }
];

export default function ManageUsers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
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
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData.map((user) => (
              <TableRow key={user.id}>
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
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.status === 'Active' ? 'default' : 'secondary'}
                    className={user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {user.role}
                </TableCell>
                <TableCell className="text-sm">
                  {user.lastActive}
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