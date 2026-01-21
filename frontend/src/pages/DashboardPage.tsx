import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  User,
  Settings,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const { user, clearAuth } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6">
          <div className="text-2xl font-bold text-blue-600">TalentConnect</div>
        </div>
        <nav className="px-4 space-y-2">
          <Link to="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start text-blue-600 bg-blue-50"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="ghost" className="w-full justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Projects
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={clearAuth}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile?.name || user?.email}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase">
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase">
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,250.00</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase">
                Profile Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">148</div>
            </CardContent>
          </Card>
        </div>

        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Link to="/projects">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium">
                        E-commerce Platform Redesign
                      </h4>
                      <p className="text-sm text-gray-500">
                        Fixed Price • $2,500
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
