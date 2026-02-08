import { useEffect, useState } from 'react';
import { Loader2, Save, User, Briefcase, DollarSign, MapPin, Link as LinkIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { profilesAPI } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';

const professionalProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  headline: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(),
  experienceYears: z.string().optional(),
  hourlyRate: z.string().optional(),
  availability: z.enum(['available', 'busy', 'not_available']).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const companyProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  description: z.string().optional(),
  companySize: z.enum(['ONE_TO_TEN', 'ELEVEN_TO_FIFTY', 'FIFTY_ONE_TO_TWO_HUNDRED', 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED', 'FIVE_HUNDRED_PLUS']).optional(),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
});

type ProfessionalFormData = z.infer<typeof professionalProfileSchema>;
type CompanyFormData = z.infer<typeof companyProfileSchema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const isProfessional = user?.userType === 'professional';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfessionalFormData | CompanyFormData>({
    resolver: zodResolver(isProfessional ? professionalProfileSchema : companyProfileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profilesAPI.getMyProfile();
      const profileData = response.data.data;
      setProfile(profileData);

      // Populate form
      if (isProfessional) {
        setValue('firstName', profileData.firstName || '');
        setValue('lastName', profileData.lastName || '');
        setValue('headline', profileData.headline || '');
        setValue('bio', profileData.bio || '');
        setValue('skills', Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '');
        setValue('experienceYears', profileData.experienceYears?.toString() || '');
        setValue('hourlyRate', profileData.hourlyRate?.toString() || '');
        setValue('availability', profileData.availability || 'available');
        setValue('location', profileData.location || '');
        setValue('timezone', profileData.timezone || '');
        setValue('portfolioUrl', profileData.portfolioUrl || '');
      } else {
        setValue('companyName', profileData.companyName || '');
        setValue('industry', profileData.industry || '');
        setValue('description', profileData.description || '');
        setValue('companySize', profileData.companySize || undefined);
        setValue('websiteUrl', profileData.websiteUrl || '');
        setValue('location', profileData.location || '');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfessionalFormData | CompanyFormData) => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = { ...data };

      if (isProfessional) {
        const profData = data as ProfessionalFormData;
        payload.skills = profData.skills ? profData.skills.split(',').map(s => s.trim()) : [];
        payload.experienceYears = profData.experienceYears ? parseInt(profData.experienceYears) : undefined;
        payload.hourlyRate = profData.hourlyRate ? parseFloat(profData.hourlyRate) : undefined;
      }

      await profilesAPI.updateMyProfile(payload);
      setSuccess('Profile updated successfully!');
      loadProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
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
        <h2 className="text-3xl font-bold mb-2">My Profile</h2>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isProfessional ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register('firstName')} disabled={isSaving} />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register('lastName')} disabled={isSaving} />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    placeholder="e.g., Full Stack Developer | React & Node.js Expert"
                    {...register('headline')}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about yourself..."
                    {...register('bio')}
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    placeholder="e.g., React, Node.js, TypeScript, PostgreSQL"
                    {...register('skills')}
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      placeholder="5"
                      {...register('experienceYears')}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      placeholder="50"
                      {...register('hourlyRate')}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={profile?.availability}
                    onValueChange={(value) => setValue('availability', value as any)}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="not_available">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      {...register('location')}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      placeholder="America/Los_Angeles"
                      {...register('timezone')}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    {...register('portfolioUrl')}
                    disabled={isSaving}
                  />
                  {errors.portfolioUrl && (
                    <p className="text-sm text-destructive">{errors.portfolioUrl.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input id="companyName" {...register('companyName')} disabled={isSaving} />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Technology, Healthcare"
                      {...register('industry')}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select
                      value={profile?.companySize}
                      onValueChange={(value) => setValue('companySize', value as any)}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONE_TO_TEN">1-10</SelectItem>
                        <SelectItem value="ELEVEN_TO_FIFTY">11-50</SelectItem>
                        <SelectItem value="FIFTY_ONE_TO_TWO_HUNDRED">51-200</SelectItem>
                        <SelectItem value="TWO_HUNDRED_ONE_TO_FIVE_HUNDRED">201-500</SelectItem>
                        <SelectItem value="FIVE_HUNDRED_PLUS">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about your company..."
                    {...register('description')}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    {...register('location')}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://yourcompany.com"
                    {...register('websiteUrl')}
                    disabled={isSaving}
                  />
                  {errors.websiteUrl && (
                    <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
