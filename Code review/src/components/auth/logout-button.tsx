"use client";

import { logout } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton({ isDarkMode = true }: { isDarkMode?: boolean }) {
  const handleLogout = async () => {
    // Clear any client-side storage
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear any custom cookies that might have been set client-side
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
    }
    
    // Call server-side logout function
    await logout();
  };

  return (
    <form action={handleLogout}>
      <Button 
        variant="ghost" 
        size="sm" 
        type="submit"
        className={`text-sm font-medium border-0 bg-transparent ${
          isDarkMode 
            ? 'text-gray-300 hover:text-primary' 
            : 'text-gray-700 hover:text-primary'
        } hover:bg-transparent`}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </form>
  );
}