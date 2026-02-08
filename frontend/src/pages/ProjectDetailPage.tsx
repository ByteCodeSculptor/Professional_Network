import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Briefcase, DollarSign, Calendar, MapPin, Clock, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  deadline: string;
  createdAt: string;
  companyId?: string;
  company?: {
    companyName: string;
    location: string;
  };
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const response = await projectsAPI.getById(id!);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to load project:', error);
      setError('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (user?.userType !== 'professional') {
      setError('Only professionals can apply to projects');
      return;
    }

    setIsApplying(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement application API call
      // await applicationsAPI.create({ projectId: id, ... });
      setSuccess('Application submitted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  const isProjectOwner = user?.userType === 'company' && project?.companyId === user?.profile?.id;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Project Not Found</CardTitle>
              <CardDescription>The project you're looking for doesn't exist.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/projects">Back to Projects</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
                  {project.company && (
                    <CardDescription className="text-base">
                      {project.company.companyName}
                    </CardDescription>
                  )}
                </div>
                <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Project Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
              </div>

              {project.requiredSkills && project.requiredSkills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">
                    ${project.budgetMin?.toLocaleString() || 0} - ${project.budgetMax?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {project.durationWeeks && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{project.durationWeeks} weeks</p>
                  </div>
                </div>
              )}

              {project.deadline && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-semibold">
                      {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {project.company?.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{project.company.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {user?.userType === 'professional' && project.status === 'open' && (
            <Card>
              <CardHeader>
                <CardTitle>Apply to this Project</CardTitle>
                <CardDescription>
                  Submit your application to work on this project
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleApply}
                  disabled={isApplying}
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {isProjectOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Project</CardTitle>
                <CardDescription>
                  Edit or update your project details
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full" 
                  onClick={handleEdit}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <Link to={`/projects/${id}/applications`}>
                    View Applications
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
