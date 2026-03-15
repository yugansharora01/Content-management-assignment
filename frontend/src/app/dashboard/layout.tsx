"use client";

import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Badge } from "@heroui/react";
import { LayoutDashboard, FileText, PieChart, Bell, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Hide nav for login page
  if (pathname === '/login') return <>{children}</>;

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Content", icon: FileText, href: "/dashboard/content" },
    { name: "Reports", icon: PieChart, href: "/dashboard/reports" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isBordered className="bg-background/70 backdrop-blur-md">
        <NavbarBrand>
          <div className="bg-primary p-1.5 rounded-lg mr-2">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <p className="font-bold text-inherit">CMS ADMIN</p>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.name} isActive={pathname === item.href}>
              <Link 
                color={pathname === item.href ? "primary" : "foreground"} 
                href={item.href}
                className="flex items-center gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem className="flex">
            <Badge content="5" color="danger" size="sm" variant="flat">
               <Button isIconOnly variant="light" radius="full">
                  <Bell className="w-5 h-5" />
               </Button>
            </Badge>
          </NavbarItem>
          
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name="Admin"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">admin@cms.com</p>
              </DropdownItem>
              <DropdownItem key="settings" startContent={<Settings className="w-4 h-4" />}>
                My Settings
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                startContent={<LogOut className="w-4 h-4" />}
                onPress={logout}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
