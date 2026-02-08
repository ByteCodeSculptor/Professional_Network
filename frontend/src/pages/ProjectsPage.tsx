import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Briefcase, DollarSign, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectsAPI } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Project {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  durationWeeks: number;
  status: string;
  requiredSkills: string[];
  createdAt: string;
}

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [searchQuery, statusFilter, sortBy, projects]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const params = user?.userType === 'company' ? {} : { status: 'open' };
      const response = await projectsAPI.getAll(params);
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.requiredSkills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'budget-high':
          return (b.budgetMax || 0) - (a.budgetMax || 0);
        case 'budget-low':
          return (a.budgetMin || 0) - (b.budgetMin || 0);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
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
        <h2 className="text-3xl font-bold mb-2">
          {user?.userType === 'company' ? 'Manage Projects' : 'Find Projects'}
        </h2>
        <p className="text-muted-foreground">
          {user?.userType === 'company' 
            ? 'View and manage your posted projects' 
            : 'Browse and apply to available projects'}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {user?.userType === 'company' && (
            <Button asChild>
              <Link to="/projects/new">Post New Project</Link>
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="budget-high">Highest Budget</SelectItem>
              <SelectItem value="budget-low">Lowest Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No projects found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : user?.userType === 'company'
                ? 'Start by posting your first project'
                : 'Check back later for new opportunities'}
            </p>
            {user?.userType === 'company' && !searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link to="/projects/new">Post a Project</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                    <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        ${project.budgetMin?.toLocaleString() || 0} - ${project.budgetMax?.toLocaleString() || 0}
                      </span>
                    </div>
                    {project.durationWeeks && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{project.durationWeeks} weeks</span>
                      </div>
                    )}
                    {project.requiredSkills && project.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.requiredSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {project.requiredSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.requiredSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to={`/projects/${project.id}`}>
                      {user?.userType === 'company' ? 'Manage' : 'View Details'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
