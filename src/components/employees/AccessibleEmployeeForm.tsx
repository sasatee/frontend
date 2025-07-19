import * as React from 'react';
import { useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  AccessibleFormRoot,
  AccessibleFormField,
  AccessibleFormGroup,
  AccessibleFormActions,
} from '@/components/ui/accessible-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_DEPARTMENTS, MOCK_JOB_TITLES } from '@/lib/mock-data';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | undefined;
  department: string;
  jobTitle: string;
  employmentType: string;
  startDate: Date | undefined;
  address: string;
  emergencyContact: string;
  skills: string;
  receiveNotifications: boolean;
}

export function AccessibleEmployeeForm() {
  const { announce } = useAccessibility();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: undefined,
    department: '',
    jobTitle: '',
    employmentType: 'full-time',
    startDate: undefined,
    address: '',
    emergencyContact: '',
    skills: '',
    receiveNotifications: false,
  });

  const handleChange = (
    field: keyof EmployeeFormData,
    value: string | boolean | Date | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when it's changed
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};
    let isValid = true;

    // Required fields
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
      isValid = false;
    }

    if (!formData.jobTitle) {
      newErrors.jobTitle = 'Job title is required';
      isValid = false;
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      announce('Form has validation errors. Please correct them before submitting.', true);
      return;
    }

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      announce('Employee information saved successfully.', false);
      // In a real app, you would save the data and navigate or show success message
    } catch (error) {
      announce('Failed to save employee information.', true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccessibleFormRoot
      onSubmit={handleSubmit}
      ariaLabel="Employee Information Form"
      ariaDescription="Enter employee details to create or update employee record"
      className="mx-auto max-w-3xl space-y-8"
    >
      <AccessibleFormGroup legend="Personal Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AccessibleFormField label="First Name" error={errors.firstName} required>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={isLoading}
            />
          </AccessibleFormField>

          <AccessibleFormField label="Last Name" error={errors.lastName} required>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={isLoading}
            />
          </AccessibleFormField>

          <AccessibleFormField label="Email" error={errors.email} required>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </AccessibleFormField>

          <AccessibleFormField label="Phone" error={errors.phone}>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={isLoading}
              autoComplete="tel"
            />
          </AccessibleFormField>

          <AccessibleFormField label="Date of Birth" error={errors.dateOfBirth}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.dateOfBirth && 'text-muted-foreground'
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateOfBirth ? (
                    format(formData.dateOfBirth, 'PPP')
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dateOfBirth}
                  onSelect={(date) => handleChange('dateOfBirth', date)}
                  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </AccessibleFormField>

          <AccessibleFormField label="Address" error={errors.address}>
            <Textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </AccessibleFormField>
        </div>
      </AccessibleFormGroup>

      <AccessibleFormGroup legend="Employment Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AccessibleFormField label="Department" error={errors.department} required>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange('department', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_DEPARTMENTS.map((dept: { id: string; name: string }) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccessibleFormField>

          <AccessibleFormField label="Job Title" error={errors.jobTitle} required>
            <Select
              value={formData.jobTitle}
              onValueChange={(value) => handleChange('jobTitle', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a job title" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_JOB_TITLES.map((job: { id: string; name: string }) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccessibleFormField>

          <AccessibleFormField label="Employment Type" error={errors.employmentType} required>
            <RadioGroup
              value={formData.employmentType}
              onValueChange={(value) => handleChange('employmentType', value)}
              disabled={isLoading}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full-time" id="full-time" />
                <label htmlFor="full-time">Full-time</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="part-time" id="part-time" />
                <label htmlFor="part-time">Part-time</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contract" id="contract" />
                <label htmlFor="contract">Contract</label>
              </div>
            </RadioGroup>
          </AccessibleFormField>

          <AccessibleFormField label="Start Date" error={errors.startDate} required>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.startDate && 'text-muted-foreground'
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? (
                    format(formData.startDate, 'PPP')
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => handleChange('startDate', date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </AccessibleFormField>
        </div>
      </AccessibleFormGroup>

      <AccessibleFormGroup legend="Additional Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AccessibleFormField label="Emergency Contact" error={errors.emergencyContact}>
            <Input
              value={formData.emergencyContact}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
              disabled={isLoading}
              placeholder="Name and phone number"
            />
          </AccessibleFormField>

          <AccessibleFormField label="Skills" error={errors.skills}>
            <Textarea
              value={formData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
              disabled={isLoading}
              placeholder="List relevant skills"
              rows={3}
            />
          </AccessibleFormField>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="notifications"
            checked={formData.receiveNotifications}
            onCheckedChange={(checked) => handleChange('receiveNotifications', checked === true)}
            disabled={isLoading}
          />
          <label
            htmlFor="notifications"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Receive email notifications
          </label>
        </div>
      </AccessibleFormGroup>

      <AccessibleFormActions>
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {isLoading ? 'Saving...' : 'Save Employee'}
        </Button>
      </AccessibleFormActions>
    </AccessibleFormRoot>
  );
}
