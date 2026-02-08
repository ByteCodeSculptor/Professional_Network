import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Briefcase, Users, DollarSign, TrendingUp, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { projectsAPI } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Project {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  status: string;
  requiredSkills: string[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalApplications: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user?.userType]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await projectsAPI.getAll();
      const projectsData = response.data || [];
      
      setProjects(projectsData.slice(0, 3)); // Show top 3 projects
      
      if (user?.userType === 'company') {
        setStats({
          totalProjects: projectsData.length,
          activeProjects: projectsData.filter((p: Project) => p.status === 'open').length,
          totalApplications: 0, // TODO: Fetch from applications API
          revenue: 0,
        });
      } else {
        setStats({
          totalProjects: projectsData.filter((p: Project) => p.status === 'open').length,
          activeProjects: 0, // TODO: Fetch applied projects
          totalApplications: 0, // TODO: Fetch user applications
          revenue: 0, // TODO: Fetch earnings
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {user?.userType === 'company' ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                <p className="text-xs text-muted-foreground">Currently open</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">Total received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hiring Pipeline</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">Open positions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applied Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                <p className="text-xs text-muted-foreground">Pending review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills Match</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Profile strength</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Projects / Recommended Projects */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.userType === 'company' ? 'Recent Projects' : 'Recommended Projects'}
          </CardTitle>
          <CardDescription>
            {user?.userType === 'company' 
              ? 'Your recently posted projects' 
              : 'Projects matching your skills'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No projects found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {user?.userType === 'company' 
                  ? 'Start by posting your first project' 
                  : 'Check back later for new opportunities'}
              </p>
              {user?.userType === 'company' && (
                <Button asChild>
                  <Link to="/projects/new">Post a Project</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        ${project.budgetMin?.toLocaleString()} - ${project.budgetMax?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/projects/${project.id}`}>View Details</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {projects.length > 0 && (
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/projects">View All Projects</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </DashboardLayout>
  );
}
