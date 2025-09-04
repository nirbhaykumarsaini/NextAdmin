"use client";

import { FiBell, FiMenu } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { User, logoutUser } from "@/redux/slices/authSlice";
import { useAppDispatch } from "@/hooks/redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export default function Header({ }) {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setUser(null);
        return;
      }

      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const result = response.data;

      if (!result.status) {
        toast.error(result.message || 'Failed to fetch profile');
        setUser(null);
        return;
      }
      
      setUser(result.user);
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch profile';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || 'Failed to fetch profile';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-900 z-40 backdrop-blur-md border-b">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <FiMenu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 cursor-pointer" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 cursor-pointer">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <Button variant="ghost" size="icon" className="relative">
            <FiBell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-3 w-3 p-0" variant="destructive" />
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild className=" cursor-pointer">
              <Button variant="ghost" className="gap-2 pl-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/john-doe.png" />
                  <AvatarFallback className="capitalize">
                    {user?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-medium text-sm">
                    {user?.username || 'Guest'}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {user?.role || 'admin'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 cursor-pointer">
              <DropdownMenuItem 
                className="cursor-pointer" 
                onClick={handleProfileClick}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/accountsettings')} className="cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive cursor-pointer" 
                onClick={() => dispatch(logoutUser())}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}