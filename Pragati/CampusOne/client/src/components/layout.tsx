import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, LayoutDashboard, Calendar, LogOut, User as UserIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getNavLinks = () => {
    if (!user) return [];
    
    if (user.role === "student") {
      return [
        { href: "/student", label: "Dashboard", icon: LayoutDashboard },
        { href: "/student/events", label: "Events", icon: Calendar },
        { href: "/student/profile", label: "Profile", icon: UserIcon },
      ];
    }
    if (user.role === "faculty") {
      return [
        { href: "/faculty", label: "Dashboard", icon: LayoutDashboard },
        { href: "/faculty/events", label: "Manage Events", icon: Calendar },
        { href: "/faculty/students", label: "Students", icon: UserIcon },
      ];
    }
    if (user.role === "admin") {
      return [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/placements", label: "Placements", icon: UserIcon },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                          location === link.href 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setIsMobileOpen(false)}>
                        <link.icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-primary cursor-pointer">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                  CO
                </div>
                CampusOne
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-2 pr-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start text-xs">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-muted-foreground capitalize">{user.role}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/auth">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-card mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CampusOne. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}