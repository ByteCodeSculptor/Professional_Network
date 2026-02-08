import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { projectsAPI } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requiredSkills: z.string().min(1, 'At least one skill is required'),
  budgetMin: z.string().min(1, 'Minimum budget is required'),
  budgetMax: z.string().min(1, 'Maximum budget is required'),
  durationWeeks: z.string().optional(),
  deadline: z.string().optional(),
}).refine((data) => {
  const min = parseFloat(data.budgetMin);
  const max = parseFloat(data.budgetMax);
  return max >= min;
}, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budgetMax'],
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function PostProjectPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectFormData, isDraft: boolean = false) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills.split(',').map(s => s.trim()),
        budgetMin: parseFloat(data.budgetMin),
        budgetMax: parseFloat(data.budgetMax),
        durationWeeks: data.durationWeeks ? parseInt(data.durationWeeks) : undefined,
        deadline: data.deadline || undefined,
        status: isDraft ? 'draft' : 'open',
      };

      const response = await projectsAPI.create(payload);
      const projectId = response.data.data.id;

      if (!isDraft) {
        await projectsAPI.publish(projectId);
      }

      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Post a New Project</h2>
        <p className="text-muted-foreground">Create a project listing to find talented professionals</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Provide information about your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Full Stack Developer for E-commerce Platform"
                {...register('title')}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <textarea
                id="description"
                rows={8}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your project in detail, including objectives, requirements, and expectations..."
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredSkills">Required Skills * (comma-separated)</Label>
              <Input
                id="requiredSkills"
                placeholder="e.g., React, Node.js, PostgreSQL, AWS"
                {...register('requiredSkills')}
                disabled={isLoading}
              />
              {errors.requiredSkills && (
                <p className="text-sm text-destructive">{errors.requiredSkills.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget & Timeline</CardTitle>
            <CardDescription>Set your project budget and timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Minimum Budget ($) *</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  step="0.01"
                  placeholder="5000"
                  {...register('budgetMin')}
                  disabled={isLoading}
                />
                {errors.budgetMin && (
                  <p className="text-sm text-destructive">{errors.budgetMin.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">Maximum Budget ($) *</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  step="0.01"
                  placeholder="10000"
                  {...register('budgetMax')}
                  disabled={isLoading}
                />
                {errors.budgetMax && (
                  <p className="text-sm text-destructive">{errors.budgetMax.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationWeeks">Duration (weeks)</Label>
                <Input
                  id="durationWeeks"
                  type="number"
                  placeholder="8"
                  {...register('durationWeeks')}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register('deadline')}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publish Project
              </>
            )}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
