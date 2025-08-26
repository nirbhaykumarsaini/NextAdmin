// store/slices/authSlice.ts
export interface Permission {
  _id: string;
  permission_name: string;
  permission_key: string;
  permission_description: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin';
  permissions: Permission[];
}

// utils/permissions.ts
export const hasPermission = (user: User | null, permissionKey: string): boolean => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check if user has the specific permission
  return user.permissions.some(permission => permission.permission_key === permissionKey);
};

export const hasAnyPermission = (user: User | null, permissionKeys: string[]): boolean => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check if user has any of the specified permissions
  return user.permissions.some(permission => 
    permissionKeys.includes(permission.permission_key)
  );
};