"use client";

import { FiSearch, FiEye, FiRefreshCw } from "react-icons/fi";
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
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface User {
  _id: string;
  name: string;
  mobile_number: string;
  m_pin:number,
  balance: number;
  batting: boolean;
  is_blocked: boolean;
  devices: Array<{
    _id: string;
    device_model?: string;
    os?: string;
    browser?: string;
    ip_address?: string;
    last_login: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: 'batting' | 'blocking' | null }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const router = useRouter();

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setRefreshLoading(true);

      const response = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setUsers(response.data.data || response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
      setRefreshLoading(false);
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(`/user-details?userId=${userId}`);
  };

  const toggleBatting = async (userId: string, currentStatus: boolean) => {
    setLoadingStates(prev => ({ ...prev, [userId]: 'batting' }));

    try {
      const response = await axios.patch(`/api/users/${userId}`, {
        batting: !currentStatus
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.status) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? { ...user, batting: !currentStatus }
              : user
          )
        );
        toast.success(`Batting ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        toast.error(response.data.message || 'Failed to update batting status');
      }
    } catch (error: unknown) {
      console.error('Error updating batting:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update batting status');
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: null }));
    }
  };

  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    setLoadingStates(prev => ({ ...prev, [userId]: 'blocking' }));

    try {
      const response = await axios.patch(`/api/users/${userId}`, {
        is_blocked: !currentStatus
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.status) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? { ...user, is_blocked: !currentStatus }
              : user
          )
        );
        toast.success(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully`);
      } else {
        toast.error(response.data.message || 'Failed to update user status');
      }
    } catch (error: unknown) {
      console.error('Error updating user block status:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update user status');
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: null }));
    }
  };

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile_number.includes(searchTerm)
    );
  }, [users, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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

  // Reset to first page when search term changes or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Format date function
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-[300px]" />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 10 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => getUsers(false)}
            disabled={refreshLoading}
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshLoading ? 'animate-spin' : ''}`} />
          </Button>
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
               <TableHead>M Pin</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Batting</TableHead>
              <TableHead>Block User</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No users found matching your search' : 'No users found'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user: User, index: number) => {
                const lastLogin = user.devices && user.devices.length > 0
                  ? new Date(Math.max(...user.devices.map(d => new Date(d.last_login).getTime())))
                  : null;
                const isLoading = loadingStates[user._id];
                const globalIndex = startIndex + index + 1;

                return (
                  <TableRow key={user._id}>
                    <TableCell className="text-sm">
                      {globalIndex}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleViewUser(user._id)} >
                        <Avatar className="h-9 w-9 capitalize">
                          <AvatarFallback>
                            {user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium capitalize hover:underline text-blue-500">
                            {user.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.mobile_number}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.m_pin}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      ₹{user.balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.batting}
                          onCheckedChange={() => toggleBatting(user._id, user.batting)}
                          disabled={isLoading === 'batting'}
                        />
                        <Label className="text-sm">
                          {user.batting ? 'On' : 'Off'}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!user.is_blocked}
                          onCheckedChange={() => toggleBlockUser(user._id, user.is_blocked)}
                          disabled={isLoading === 'blocking'}
                        />
                        <Label className="text-sm">
                          {user.is_blocked ? 'Blocked' : 'Active'}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.devices?.length || 0}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_blocked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lastLogin ? formatDate(lastLogin.toISOString()) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => handleViewUser(user._id)}
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer text-blue-600 hover:text-blue-800"
                          title="View User Details"
                        >
                          <FiEye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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
        </div>
      )}

      {filteredUsers.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground py-8">
          {users.length === 0 ? "No users found" : "No users match your search"}
        </div>
      )}
    </div>
  );
}