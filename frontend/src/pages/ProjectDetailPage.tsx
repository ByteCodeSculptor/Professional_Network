import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Calendar, DollarSign, MapPin, Briefcase } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id!);
      setProject(response.data.project);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/projects" className="flex items-center text-blue-600 mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex gap-2 mb-2">
                  <Badge>{project.category}</Badge>
                  <Badge variant="outline">Full-time</Badge>
                </div>
                <CardTitle className="text-3xl font-bold">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
                
                <h3 className="text-lg font-semibold mt-6 mb-2">Requirements</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>Minimum 3 years of experience in React</li>
                  <li>Strong understanding of TypeScript</li>
                  <li>Experience with RESTful APIs</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center text-gray-700">
                  <DollarSign className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Budget</div>
                    <div className="font-semibold">${project.budget}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-semibold">{project.location || 'Remote'}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Posted</div>
                    <div className="font-semibold">January 15, 2025</div>
                  </div>
                </div>
                <Button className="w-full h-12 text-lg">Apply Now</Button>
                <Button variant="outline" className="w-full">Save Project</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">About the Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    TC
                  </div>
                  <div>
                    <div className="font-medium">TechCorp Inc.</div>
                    <div className="text-xs text-gray-500">Verified Client</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  A leading software solutions provider based in San Francisco.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}