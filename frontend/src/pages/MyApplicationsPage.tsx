import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { applicationsAPI } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Application {
  id: string;
  status: string;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: number;
  createdAt: string;
  project: {
    id: string;
    title: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    company: {
      companyName: string;
    };
  };
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const response = await applicationsAPI.getMyApplications();
      setApplications(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'shortlisted':
        return <AlertCircle className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'shortlisted':
        return 'secondary';
      case 'rejected':
      case 'withdrawn':
        return 'destructive';
      default:
        return 'outline';
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
        <h2 className="text-3xl font-bold mb-2">My Applications</h2>
        <p className="text-muted-foreground">Track your project applications and their status</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No applications yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Start applying to projects to see them here
            </p>
            <Button asChild>
              <Link to="/projects">Browse Projects</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {application.project.title}
                    </CardTitle>
                    <CardDescription>
                      {application.project.company.companyName}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(application.status)} className="flex items-center gap-1">
                    {getStatusIcon(application.status)}
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Proposed Rate</p>
                    <p className="font-semibold">
                      ${application.proposedRate?.toLocaleString() || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Duration</p>
                    <p className="font-semibold">
                      {application.estimatedDuration ? `${application.estimatedDuration} weeks` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Applied On</p>
                    <p className="font-semibold">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Project Budget</p>
                    <p className="font-semibold">
                      ${application.project.budgetMin?.toLocaleString()} - ${application.project.budgetMax?.toLocaleString()}
                    </p>
                  </div>
                </div>
                {application.coverLetter && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">Cover Letter</p>
                    <p className="text-sm">{application.coverLetter}</p>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/projects/${application.project.id}`}>View Project</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/applications/${application.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
