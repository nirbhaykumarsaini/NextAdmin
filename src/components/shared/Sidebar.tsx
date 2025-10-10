"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiSettings,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiGlobe,
  FiWind,
  FiUser,
  FiSliders,
  FiTool,
  FiZap,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
  FiDollarSign,
  FiTag,
  FiShoppingBag,
  FiMoreHorizontal,
} from "react-icons/fi";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FileOutput } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // ✅ ensures only one menu is open at a time
  const toggleItem = (label: string) => {
    setOpenItems(prev => {
      const isCurrentlyOpen = !!prev[label];
      return { [label]: !isCurrentlyOpen };
    });
  };

  const navItems = [
    {
      href: "/dashboard",
      icon: <FiHome className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/users/manage",
      icon: <FiUser className="h-5 w-5" />,
      label: "Manage Users",
    },
    {
      label: "Game Management",
      icon: <FiTag className="h-5 w-5" />,
      submenu: [
        { href: "/mainmarket", label: "Main Market Game" },
        { href: "/starline", label: "Starline Game" },
        { href: "/galidisawar", label: "Galidisawar Game" },
      ],
    },
    {
      href: "/withdrawal",
      icon: <FiDollarSign className="h-5 w-5" />,
      label: "Withdrawal",
    },
     {
      href: "/funds",
      icon: <FiFileText className="h-5 w-5" />,
      label: "Funds",
    },
    //  {
    //   href: "/profit-loss",
    //   icon: <FileOutput className="h-5 w-5" />,
    //   label: "Total P&L",
    // },
    {
      label: "Game Rates",
      icon: <FiBarChart2  className="h-5 w-5" />,
      submenu: [
        { href: "/mainmarketrate", label: "Main Market Rate" },
        { href: "/starlinerate", label: "Starline Rate" },
        { href: "/galidisawarrate", label: "Galidisawar Rate" },
      ],
    },
    {
      label: "Results",
      icon: <FiAward className="h-5 w-5" />,
      submenu: [
        { href: "/mainmarketresult", label: "Main Market Result" },
        { href: "/starlineresult", label: "Starline Result" },
        { href: "/galidisawarresult", label: "Galidisawar Result" },
      ],
    },
    {
      label: "Winner Report",
      icon: <FiTrendingUp  className="h-5 w-5" />,
      submenu: [
        { href: "/mainmarketwinner", label: "Main Market Winner" },
        { href: "/starlinewinner", label: "Starline Winner" },
        { href: "/galidisawarwinner", label: "Galidisawar Winner" },
      ],
    },
    {
      label: "Sale Report",
      icon: <FiShoppingBag  className="h-5 w-5" />,
      submenu: [
        { href: "/mainmarketsale", label: "Main Market Sale" },
        { href: "/starlinesale", label: "Starline Sale" },
        { href: "/galidisawarsale", label: "Galidisawar Sale" },
      ],
    },
    {
      label: "Bid Report",
      icon: <FiGlobe className="h-5 w-5" />,
      submenu: [
        { href: "/mainmarketbidreports", label: "Main Market Bid Report" },
        { href: "/starlinebidreports", label: "Starline Bid Report" },
        { href: "/galidisawarbidreports", label: "Galidisawar Bid Report" },
      ],
    },
    {
      href: "/deletebidreport",
      icon: <FiZap className="h-5 w-5" />,
      label: "Delete Bid Report",
    },
    {
      label: "App Setting",
      icon: <FiSettings className="h-5 w-5" />,
      submenu: [
        { href: "/managelogo", label: "Manage Logo" },
        { href: "/footerlinks", label: "Footer Links" },
        { href: "/contactinfo", label: "Contact Info" },
        { href: "/manageupi", label: "Manage Upi" },
        { href: "/accountsettings", label: "Account Rules & Limits" },
      ],
    },
    {
      label: "Games Type",
      icon: <FiSliders className="h-5 w-5" />,
      submenu: [
        { href: "/singledigit", label: "Single Digit" },
        { href: "/jodidigit", label: "Jodi Digit" },
        { href: "/singlepanna", label: "Single Panna" },
        { href: "/doublepanna", label: "Double Panna" },
        { href: "/triplepanna", label: "Triple Panna" },
        { href: "/halfsangam", label: "Half Sangam" },
        { href: "/fullsangam", label: "Full Sangam" },
      ],
    },
    {
      label: "Advanced System",
      icon: <FiTool className="h-5 w-5" />,
      submenu: [
        { href: "/slider", label: "Slider" },
        { href: "/notice", label: "Notice" },
        { href: "/howtoplay", label: "How to Play" },
        { href: "/maintenance", label: "Maintenance" },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "relative h-screen overflow-y-auto border-r bg-white dark:bg-gray-900 z-50 transition-all duration-300 ease-in-out scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col p-2">
        <div
          className={cn(
            "flex items-center justify-between p-2 mb-4",
            isCollapsed ? "flex-col gap-2" : ""
          )}
        >
          {!isCollapsed && (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AdminPro
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <FiChevronRight className="h-4 w-4" />
            ) : (
              <FiChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              if (item.href) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md p-2 text-base font-normal transition-colors mb-1",
                      pathname === item.href
                        ? "bg-muted"
                        : "hover:bg-muted/50",
                      isCollapsed ? "justify-center" : ""
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span
                      className={cn("flex-shrink-0", isCollapsed ? "" : "mr-3")}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              }

              if (item.submenu) {
                const hasActiveChild = item.submenu.some(
                  (subItem) => pathname === subItem.href
                );

                return (
                  <Collapsible
                    key={item.label}
                    open={
                      isCollapsed
                        ? false
                        : openItems[item.label] || hasActiveChild
                    }
                    onOpenChange={() => toggleItem(item.label)}
                    disabled={isCollapsed}
                  >
                    <CollapsibleTrigger
                      className={cn(
                        "flex w-full items-center justify-between rounded-md p-2 text-sm font-medium transition-colors mb-2 cursor-pointer",
                        hasActiveChild ? "bg-muted" : "hover:bg-muted/50",
                        isCollapsed ? "justify-center" : ""
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center">
                        <span
                          className={cn(
                            "flex-shrink-0",
                            isCollapsed ? "" : "mr-3"
                          )}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="text-base font-normal">
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <FiChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openItems[item.label] || hasActiveChild
                              ? "rotate-180"
                              : ""
                          )}
                        />
                      )}
                    </CollapsibleTrigger>
                    {!isCollapsed && (
                      <CollapsibleContent className="pl-12">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center rounded-md p-2 text-sm font-normal transition-colors mt-1",
                              pathname === subItem.href
                                ? "bg-muted"
                                : "hover:bg-muted/50"
                            )}
                          >
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                );
              }

              return null;
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}

// ✅ Mobile version
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <FiChevronRight className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
