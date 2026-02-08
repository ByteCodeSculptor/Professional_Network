import { useEffect, useState } from 'react';
import { Loader2, Search, Users, DollarSign, MapPin, Briefcase, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { profilesAPI } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  bio: string;
  skills: string[] | string;
  experienceYears: number;
  hourlyRate: number;
  availability: string;
  location: string;
  portfolioUrl: string;
  user: {
    email: string;
  };
}

export default function SearchTalentPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchSkills, setSearchSkills] = useState('');
  const [availability, setAvailability] = useState('all');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setIsLoading(true);
      const response = await profilesAPI.searchProfessionals();
      const data = response.data.data || [];
      setProfessionals(data);
      setFilteredProfessionals(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load professionals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      if (searchSkills) params.skills = searchSkills;
      if (availability !== 'all') params.availability = availability;
      if (minRate) params.minRate = minRate;
      if (maxRate) params.maxRate = maxRate;
      if (location) params.location = location;

      const response = await profilesAPI.searchProfessionals(params);
      setFilteredProfessionals(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'busy':
        return 'secondary';
      case 'not_available':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const parseSkills = (skills: string[] | string): string[] => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      try {
        return JSON.parse(skills);
      } catch {
        return [];
      }
    }
    return [];
  };

  if (isLoading && professionals.length === 0) {
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
        <h2 className="text-3xl font-bold mb-2">Search Talent</h2>
        <p className="text-muted-foreground">Find skilled professionals for your projects</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="e.g., React, Node.js"
                value={searchSkills}
                onChange={(e) => setSearchSkills(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="not_available">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minRate">Min Hourly Rate ($)</Label>
              <Input
                id="minRate"
                type="number"
                placeholder="0"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRate">Max Hourly Rate ($)</Label>
              <Input
                id="maxRate"
                type="number"
                placeholder="200"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredProfessionals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No professionals found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Found {filteredProfessionals.length} professional{filteredProfessionals.length !== 1 ? 's' : ''}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfessionals.map((professional) => (
              <Card key={professional.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {professional.firstName} {professional.lastName}
                      </CardTitle>
                      {professional.headline && (
                        <CardDescription className="mt-1">{professional.headline}</CardDescription>
                      )}
                    </div>
                    <Badge variant={getAvailabilityColor(professional.availability) as any}>
                      {professional.availability}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {professional.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{professional.bio}</p>
                  )}

                  <div className="space-y-2">
                    {professional.experienceYears && (
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{professional.experienceYears} years experience</span>
                      </div>
                    )}

                    {professional.hourlyRate && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>${professional.hourlyRate}/hour</span>
                      </div>
                    )}

                    {professional.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{professional.location}</span>
                      </div>
                    )}
                  </div>

                  {parseSkills(professional.skills).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {parseSkills(professional.skills).slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {parseSkills(professional.skills).length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{parseSkills(professional.skills).length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardContent className="pt-0">
                  <Button className="w-full" variant="outline">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
