"use client";

import { FiEdit, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiPlus, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from 'axios';
import { toast } from 'sonner';

interface Permission {
  _id: string;
  permission_name: string;
  permission_key: string;
  permission_description: string;
}

interface Role {
  _id: string;
  role_name: string;
  role_description: string;
  permissions: Permission[];
}

interface FormData {
  role_name: string;
  role_description: string;
  permissions: string[];
}

export default function Roles() {
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    role_name: '',
    role_description: '',
    permissions: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Fetch roles and permissions on component mount
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [pagination.page]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/roles?page=${pagination.page}&limit=${pagination.limit}`);
      if (response.data.status) {
        setRolesData(response.data.data);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        toast.error('Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get('/api/permissions');
      if (response.data.status) {
        setAllPermissions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => {
      if (prev.permissions.includes(permissionId)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permissionId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permissionId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let response;

      if (editingRole) {
        // Update existing role
        response = await axios.put(`/api/roles?id=${editingRole._id}`, formData);
      } else {
        // Create new role
        response = await axios.post('/api/roles', formData);
      }

      if (response.data.status) {
        toast.success(response.data.message);
        setShowRoleForm(false);
        setFormData({ role_name: '', role_description: '', permissions: [] });
        setEditingRole(null);
        fetchRoles(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to save role');
      }
    } catch (error: any) {
      console.error('Error saving role:', error);
      toast.error(error.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      role_name: role.role_name,
      role_description: role.role_description,
      permissions: role.permissions.map(p => p._id)
    });
    setShowRoleForm(true);
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      setLoading(true);
      const response = await axios.delete(`/api/roles?id=${id}`);
      if (response.data.status) {
        toast.success('Role deleted successfully');
        fetchRoles(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to delete role');
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error(error.response?.data?.message || 'Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Roles Management Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Roles Management</h2>
          <Dialog open={showRoleForm} onOpenChange={setShowRoleForm}>
            <DialogTrigger asChild>
              <Button disabled={loading}>
                <FiPlus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Edit Role' : 'Add New Role'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role_name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="role_name"
                      name="role_name"
                      value={formData.role_name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role_description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="role_description"
                      name="role_description"
                      value={formData.role_description}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Permissions</Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {allPermissions.map((permission) => (
                        <div key={permission._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission._id}
                            checked={formData.permissions.includes(permission._id)}
                            onCheckedChange={() => handlePermissionToggle(permission._id)}
                            disabled={loading}
                          />
                          <Label htmlFor={permission._id} className="text-sm font-normal cursor-pointer">
                            <div className="font-medium">{permission.permission_name}</div>
                            {/* <div className="text-xs text-muted-foreground">{permission.permission_key}</div> */}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRoleForm(false);
                      setEditingRole(null);
                      setFormData({ role_name: '', role_description: '', permissions: [] });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingRole ? 'Update Role' : 'Create Role'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roles Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && rolesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading roles...
                  </TableCell>
                </TableRow>
              ) : rolesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No roles found. Create your first role.
                  </TableCell>
                </TableRow>
              ) : (
                rolesData.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell className="font-medium">{role.role_name}</TableCell>
                    <TableCell>{role.role_description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map(permission => (
                          <Badge key={permission._id} variant="secondary" className="text-xs">
                            {permission.permission_name.split(' ')[0]}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRole(role)}
                        className="text-primary hover:text-primary/80"
                        disabled={loading}
                      >
                        <FiEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDeleteRole(role._id)}
                        disabled={loading}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === pagination.page}
                    onClick={() => handlePageChange(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={pagination.page === pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}