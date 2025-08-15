"use client";

import { FiEdit, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiPlus, FiX } from "react-icons/fi";
import { useState } from "react";
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
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";

interface Role{
  id:number,
  name:string,
  description:string,
  permissions:string[],
  users:number
}

interface FormData {
  name:string,
  description:string,
  permissions:string[]
}

export default function Roles() {
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    permissions: []
  });

  const handleInputChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (permission:string) => {
    setFormData(prev => {
      if (prev.permissions.includes(permission)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permission) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permission] };
      }
    });
  };

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (add/edit role)
    console.log('Form submitted:', formData);
    setShowRoleForm(false);
    setFormData({ name: '', description: '', permissions: [] });
    setEditingRole(null);
  };

  const handleEditRole = (role:Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setShowRoleForm(true);
  };

  // Available permissions
  const allPermissions:string[] = [
    'create_user',
    'edit_user',
    'delete_user',
    'view_users',
    'create_content',
    'edit_content',
    'delete_content',
    'view_content',
    'manage_roles',
    'view_dashboard'
  ];

  // Sample roles data
  const rolesData:Role[] = [
    {
      id: 1,
      name: 'Admin',
      description: 'Full access to all features',
      permissions: allPermissions,
      users: 5
    },
    {
      id: 2,
      name: 'Editor',
      description: 'Can create and edit content',
      permissions: ['create_content', 'edit_content', 'view_content', 'view_dashboard'],
      users: 12
    },
    {
      id: 3,
      name: 'Viewer',
      description: 'Can only view content',
      permissions: ['view_content', 'view_dashboard'],
      users: 24
    },
    {
      id: 4,
      name: 'Moderator',
      description: 'Can manage users and content',
      permissions: ['create_user', 'edit_user', 'view_users', 'create_content', 'edit_content', 'view_content', 'view_dashboard'],
      users: 8
    }
  ];

  return (
    <div className="space-y-6">
      {/* Roles Management Section */}
      <div>
        <div className="flex justify-between items-center mb-6 ">
          <h2 className="text-2xl font-bold tracking-tight">Roles Management</h2>
          <Dialog open={showRoleForm} onOpenChange={setShowRoleForm} >
            <DialogTrigger asChild>
              <Button>
                <FiPlus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Edit Role' : 'Add New Role'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Permissions</Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                      {allPermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={formData.permissions.includes(permission)}
                            onCheckedChange={() => handlePermissionToggle(permission)}
                          />
                          <Label htmlFor={permission} className="text-sm font-normal">
                            {permission.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                      setFormData({ name: '', description: '', permissions: [] });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRole ? 'Update Role' : 'Create Role'}
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
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesData.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{role.users}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map(permission => (
                        <Badge key={permission} variant="secondary">
                          {permission.split('_')[0]}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="secondary">
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
                    >
                      <FiEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination className="mt-4">
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
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}