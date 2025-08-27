"use client";

import { FiDollarSign, FiTrendingUp, FiEdit, FiTrash2, FiPlus, FiUser, FiLock, FiEye, FiSettings } from "react-icons/fi";
import { useState, useEffect, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Permission {
  _id: string;
  permission_name: string;
  permission_key: string;
  permission_description: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  permission_name: string;
  permission_key: string;
  permission_description: string;
  category: string;
}

export default function Permissions() {
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [permissionsData, setPermissionsData] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    permission_name: '',
    permission_key: '',
    permission_description: '',
    category: 'Users'
  });

  // Fetch permissions on component mount
  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/permissions');
      if (response.data.status) {
        setPermissionsData(response.data.data);
      } else {
        toast.error('Failed to fetch permissions');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let response;

      if (editingPermission) {
        // Update existing permission
        response = await axios.put(`/api/permissions?id=${editingPermission._id}`, formData);
      } else {
        // Create new permission
        response = await axios.post('/api/permissions', formData);
      }

      if (response.data.status) {
        toast.success(response.data.message);
        setShowPermissionForm(false);
        setFormData({ permission_name: '', permission_key: '', permission_description: '', category: 'Users' });
        setEditingPermission(null);
        fetchPermissions(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to save permission');
      }
    } catch (error: unknown) {
      console.error('Error saving permission:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to save permission');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to save permission');
      }
    }finally {
      setLoading(false);
    }
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      permission_name: permission.permission_name,
      permission_key: permission.permission_key,
      permission_description: permission.permission_description,
      category: permission.category
    });
    setShowPermissionForm(true);
  };

  const handleDeletePermission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;

    try {
      setLoading(true);
      const response = await axios.delete(`/api/permissions?id=${id}`);
      if (response.data.status) {
        toast.success('Permission deleted successfully');
        fetchPermissions(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to delete permission');
      }
    }catch (error: unknown) {
      console.error('Error deleting permission:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete permission');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to delete permission');
      }
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by category for better organization
  const groupedPermissions: Record<string, Permission[]> = permissionsData.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  const categoryIcons: Record<string, JSX.Element> = {
    'Users': <FiUser className="mr-2 h-4 w-4" />,
    'Content': <FiEye className="mr-2 h-4 w-4" />,
    'System': <FiSettings className="mr-2 h-4 w-4" />,
    'Financial': <FiDollarSign className="mr-2 h-4 w-4" />,
    'Analytics': <FiTrendingUp className="mr-2 h-4 w-4" />
  };

  return (
    <div className="space-x-6">
      {/* Permissions Management Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Permissions Management</h2>
          <Dialog open={showPermissionForm} onOpenChange={setShowPermissionForm}>
            <DialogTrigger asChild>
              <Button disabled={loading}>
                <FiPlus className="mr-2 h-4 w-4" />
                Add Permission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPermission ? 'Edit Permission' : 'Add New Permission'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="permission_name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="permission_name"
                      name="permission_name"
                      value={formData.permission_name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="permission_key" className="text-right">
                      Key
                    </Label>
                    <Input
                      id="permission_key"
                      name="permission_key"
                      value={formData.permission_key}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                      disabled={loading}
                      placeholder="view_users"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                      disabled={loading}
                    >
                      <SelectTrigger className="col-span-3 w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Users">Users</SelectItem>
                        <SelectItem value="Content">Content</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="permission_description" className="text-right mt-2">
                      Description
                    </Label>
                    <Textarea
                      id="permission_description"
                      name="permission_description"
                      value={formData.permission_description}
                      onChange={handleInputChange}
                      className="col-span-3"
                      rows={3}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPermissionForm(false);
                      setEditingPermission(null);
                      setFormData({ permission_name: '', permission_key: '', permission_description: '', category: 'Users' });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingPermission ? 'Update Permission' : 'Create Permission'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Permissions List */}
        <div className="space-y-6">
          {loading && permissionsData.length === 0 ? (
            <div className="text-center py-8">Loading permissions...</div>
          ) : permissionsData.length === 0 ? (
            <div className="text-center py-8">No permissions found. Create your first permission.</div>
          ) : (
            Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-medium flex items-center">
                  {categoryIcons[category] || <FiSettings className="mr-2 h-4 w-4" />}
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map((permission) => (
                    <Card key={permission._id} className="bg-white dark:bg-gray-800 gap-0">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <FiLock className="h-4 w-4 text-blue-500" />
                            <CardTitle className="text-lg">{permission.permission_name}</CardTitle>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditPermission(permission)}
                              disabled={loading}
                            >
                              <FiEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/80"
                              onClick={() => handleDeletePermission(permission._id)}
                              disabled={loading}
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          {permission.permission_description}
                        </p>
                        <Badge variant="secondary">{permission.permission_key}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}