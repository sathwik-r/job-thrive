import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X, Filter } from "lucide-react";
import React from "react";

export interface FilterOptions {
  search: string;
  company: string;
  role: string;
  experience: number[];
  expertise: string[];
  availability: string;
  priceRange: number[];
}

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Airbnb'];
const roles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Designer', 'Marketing', 'Sales'];
const expertiseOptions = ['React', 'Node.js', 'Python', 'System Design', 'Leadership', 'Product Strategy', 'Data Analysis', 'UX Design'];

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const removeExpertise = (expertise: string) => {
    updateFilters({
      expertise: filters.expertise.filter(e => e !== expertise)
    });
  };

  const addExpertise = (expertise: string) => {
    if (!filters.expertise.includes(expertise)) {
      updateFilters({
        expertise: [...filters.expertise, expertise]
      });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      company: '',
      role: '',
      experience: [0, 20],
      expertise: [],
      availability: '',
      priceRange: [0, 500]
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search mentors by name, company, or expertise..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
          data-testid="input-search-mentors"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid="button-toggle-filters"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        {(filters.company || filters.role || filters.expertise.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            data-testid="button-clear-filters"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filter Mentors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company */}
            <div>
              <label className="text-xs font-medium mb-2 block">Company</label>
              <Select value={filters.company} onValueChange={(value) => updateFilters({ company: value })}>
                <SelectTrigger data-testid="select-company">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-medium mb-2 block">Role</label>
              <Select value={filters.role} onValueChange={(value) => updateFilters({ role: value })}>
                <SelectTrigger data-testid="select-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience */}
            <div>
              <label className="text-xs font-medium mb-2 block">
                Experience: {filters.experience[0]} - {filters.experience[1]} years
              </label>
              <Slider
                value={filters.experience}
                onValueChange={(value) => updateFilters({ experience: value })}
                max={20}
                step={1}
                className="w-full"
                data-testid="slider-experience"
              />
            </div>

            {/* Expertise */}
            <div>
              <label className="text-xs font-medium mb-2 block">Expertise</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.expertise.map((expertise) => (
                  <Badge key={expertise} variant="secondary" className="text-xs">
                    {expertise}
                    <button
                      onClick={() => removeExpertise(expertise)}
                      className="ml-1 hover:text-destructive"
                      data-testid={`button-remove-expertise-${expertise}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addExpertise}>
                <SelectTrigger data-testid="select-expertise">
                  <SelectValue placeholder="Add expertise" />
                </SelectTrigger>
                <SelectContent>
                  {expertiseOptions
                    .filter(expertise => !filters.expertise.includes(expertise))
                    .map((expertise) => (
                      <SelectItem key={expertise} value={expertise}>
                        {expertise}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div>
              <label className="text-xs font-medium mb-2 block">Availability</label>
              <Select value={filters.availability} onValueChange={(value) => updateFilters({ availability: value })}>
                <SelectTrigger data-testid="select-availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="available">Available Now</SelectItem>
                  <SelectItem value="busy">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}