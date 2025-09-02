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
  _id: string
  username: string,
  role: string,
  updatedAt: string,
  createdAt: string
}

export default function ManageUsers() {

  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    getUsers()
  }, [])

  const getUsers = async () => {
    try {
      const response = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      setUsers(response.data.data)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error)
      }
    }
  }



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
              <TableHead>S. No.</TableHead>
              <TableHead>User</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead>Role</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: User, index: number) => (
              <TableRow key={user._id}>
                <TableCell className="text-sm">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9 capitalize">
                      <AvatarFallback>
                        {user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {user.username}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm">
                  {user.role}
                </TableCell>
                <TableCell className="text-sm">
                  {user.updatedAt}
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