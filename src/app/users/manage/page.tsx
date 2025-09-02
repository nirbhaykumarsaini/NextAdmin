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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";
import axios from "axios";

export interface User {
  id: string;
  name: string;
  mobile_number: string;
  balance: number;
  batting: boolean;
  device_count: number;
  is_blocked: boolean;
  // Add these if they exist in your actual response
  createdAt?: string;
  updatedAt?: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const response = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setUsers(response.data.data || response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
      }
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile_number.includes(searchTerm)
  );

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

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
              <TableHead>User</TableHead>
              <TableHead>Mobile Number</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Batting</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead>Joined Date</TableHead> */}
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user: User, index: number) => (
              <TableRow key={user.id}>
                <TableCell className="text-sm">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9 capitalize">
                      <AvatarFallback>
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium capitalize">
                        {user.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {user.id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {user.mobile_number}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  ₹{user.balance.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.batting 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.batting ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {user.device_count}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_blocked 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </TableCell>
                {/* <TableCell className="text-sm">
                  {formatDate(user.createdAt)}
                </TableCell> */}
                {/* <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                    <FiEdit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found
        </div>
      )}

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