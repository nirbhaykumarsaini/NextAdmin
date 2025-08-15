"use client";

import { FiActivity, FiDollarSign, FiUserPlus, FiTrendingUp, FiEdit, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiPlus, FiX, FiUser, FiLock, FiEye, FiSettings } from "react-icons/fi";
import { useState } from "react";
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


interface Permissions{
  id:number,
  name:string,
  key:string,
  description:string,
   category: string;
}

interface FormData{
  name:string,
  key:string,
  description:string
}

export default function Permissions() {
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permissions | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    key: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (add/edit permission)
    console.log('Form submitted:', formData);
    setShowPermissionForm(false);
    setFormData({ name: '', key: '', description: '' });
    setEditingPermission(null);
  };

  const handleEditPermission = (permission:Permissions) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      key: permission.key,
      description: permission.description
    });
    setShowPermissionForm(true);
  };

  // Sample permissions data
  const permissionsData = [
    { id: 1, name: 'View Users', key: 'view_users', description: 'Can view user list and profiles', category: 'Users' },
    { id: 2, name: 'Create Users', key: 'create_users', description: 'Can create new user accounts', category: 'Users' },
    { id: 3, name: 'Edit Users', key: 'edit_users', description: 'Can edit existing user accounts', category: 'Users' },
    { id: 4, name: 'Delete Users', key: 'delete_users', description: 'Can delete user accounts', category: 'Users' },
    { id: 5, name: 'View Content', key: 'view_content', description: 'Can view all content', category: 'Content' },
    { id: 6, name: 'Create Content', key: 'create_content', description: 'Can create new content', category: 'Content' },
    { id: 7, name: 'Edit Content', key: 'edit_content', description: 'Can edit existing content', category: 'Content' },
    { id: 8, name: 'Delete Content', key: 'delete_content', description: 'Can delete content', category: 'Content' },
    { id: 9, name: 'Manage Permissions', key: 'manage_permissions', description: 'Can manage system permissions', category: 'System' },
    { id: 10, name: 'View Dashboard', key: 'view_dashboard', description: 'Can view the admin dashboard', category: 'System' },
  ];

  // Group permissions by category for better organization
  const groupedPermissions : Record<string, Permissions[]> = permissionsData.reduce((acc:Record<string, Permissions[]>, permission:Permissions) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  return (
    <div className="space-x-6">
      {/* Permissions Management Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Permissions Management</h2>
          <Dialog open={showPermissionForm} onOpenChange={setShowPermissionForm}>
            <DialogTrigger asChild>
              <Button>
                <FiPlus className="mr-2 h-4 w-4" />
                Add Permission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPermission ? 'Edit Permission' : 'Add New Permission'}
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
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="key" className="text-right">
                      Key
                    </Label>
                    <Input
                      id="key"
                      name="key"
                      value={formData.key}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right mt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                      rows={3}
                      required
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
                      setFormData({ name: '', key: '', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPermission ? 'Update Permission' : 'Create Permission'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Permissions List */}
        <div className="space-y-6 ">
          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-medium flex items-center">
                {category === 'Users' && <FiUser className="mr-2 h-4 w-4" />}
                {category === 'Content' && <FiEye className="mr-2 h-4 w-4" />}
                {category === 'System' && <FiSettings className="mr-2 h-4 w-4" />}
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((permission) => (
                  <Card key={permission.id} className="bg-white dark:bg-gray-800 gap-0">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2 ">
                          <FiLock className="h-4 w-4 text-blue-500" />
                          <CardTitle className="text-lg">{permission.name}</CardTitle>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditPermission(permission)}
                          >
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {permission.description}
                      </p>
                      <Badge variant="secondary">{permission.key}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

       
      </div>
    </div>
  );
}