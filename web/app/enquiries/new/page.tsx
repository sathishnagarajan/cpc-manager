'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft } from 'lucide-react';
import { apiService } from '@/lib/api';
import { ENQUIRY_TYPES, VISIT_TYPES, CONTACT_METHODS } from '@/lib/constants';

interface ChennaiArea {
  area: string;
  pincode: string;
}

export default function NewEnquiryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<ChennaiArea[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<ChennaiArea[]>([]);
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    enquiry_date: new Date().toISOString().split('T')[0],
    enquiry_type: '',
    area: '',
    pincode: '',
    visit_type: '',
    contact_method: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load Chennai areas
    const loadAreas = async () => {
      try {
        const response = await apiService.getChennaiAreas();
        if (response.status === 'success') {
          setAreas(response.data);
          setFilteredAreas(response.data);
        }
      } catch (error) {
        console.error('Failed to load Chennai areas:', error);
      }
    };
    loadAreas();
  }, []);

  const handleAreaSearch = (value: string) => {
    setAreaSearch(value);
    setFormData({ ...formData, area: value, pincode: '' });
    
    if (value.length > 0) {
      const filtered = areas.filter(area =>
        area.area.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAreas(filtered);
      setShowAreaDropdown(true);
    } else {
      setFilteredAreas(areas);
      setShowAreaDropdown(false);
    }
  };

  const selectArea = (area: ChennaiArea) => {
    setFormData({ ...formData, area: area.area, pincode: area.pincode });
    setAreaSearch(area.area);
    setShowAreaDropdown(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.enquiry_date) newErrors.enquiry_date = 'Enquiry date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setLoading(true);
    console.log('Starting API call...');

    try {
      const response = await apiService.createEnquiry(formData);
      console.log('API response received:', response);
      
      if (response.status === 'success') {
        router.push('/enquiries');
      }
    } catch (error) {
      // Log everything about the error
      console.error('=== ERROR CAUGHT ===');
      console.error('Error object:', error);
      console.error('Error message:', (error as { message?: string }).message);
      console.error('Error code:', (error as { code?: string }).code);
      console.error('Error response:', (error as { response?: { data?: { messages?: Record<string, string | string[]> }; status?: number } }).response);
      console.error('Error response data:', (error as { response?: { data?: unknown } }).response?.data);
      console.error('Error response status:', (error as { response?: { status?: number } }).response?.status);
      console.error('===================');
      
      // Handle validation errors from backend
      const axiosError = error as { response?: { data?: { messages?: Record<string, string | string[]> } } };
      if (axiosError.response?.data?.messages) {
        const backendErrors: Record<string, string> = {};
        const messages = axiosError.response.data.messages;
        
        // Convert backend validation messages to our error format
        Object.keys(messages).forEach(key => {
          if (Array.isArray(messages[key])) {
            backendErrors[key] = messages[key][0];
          } else {
            backendErrors[key] = messages[key];
          }
        });
        
        setErrors(backendErrors);
        alert('Please check the form for errors: ' + Object.values(backendErrors).join(', '));
      } else {
        const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
        const errorMsg = axiosErr.response?.data?.message || axiosErr.message || 'Unknown error occurred';
        alert('Failed to create enquiry: ' + errorMsg);
      }
    } finally {
      setLoading(false);
      console.log('API call completed');
    }
  };

  return (
    <div className="flex flex-col w-full">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-2">
          <Link href="/enquiries">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-lg font-semibold md:text-2xl">New Enquiry</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Enquiry Information</CardTitle>
              <CardDescription>Capture initial contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email (optional)"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enquiry_date">Enquiry Date *</Label>
                  <Input
                    id="enquiry_date"
                    type="date"
                    value={formData.enquiry_date}
                    onChange={(e) => handleInputChange('enquiry_date', e.target.value)}
                    className={errors.enquiry_date ? 'border-red-500' : ''}
                  />
                  {errors.enquiry_date && <p className="text-sm text-red-500">{errors.enquiry_date}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="enquiry_type">Enquiry Type</Label>
                  <Select value={formData.enquiry_type} onValueChange={(value) => handleInputChange('enquiry_type', value)}>
                    <SelectTrigger id="enquiry_type">
                      <SelectValue placeholder="Select enquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENQUIRY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit_type">Visit Type</Label>
                  <Select value={formData.visit_type} onValueChange={(value) => handleInputChange('visit_type', value)}>
                    <SelectTrigger id="visit_type">
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 relative">
                  <Label htmlFor="area">Area (Chennai)</Label>
                  <Input
                    id="area"
                    placeholder="Type to search area..."
                    value={areaSearch}
                    onChange={(e) => handleAreaSearch(e.target.value)}
                    onFocus={() => setShowAreaDropdown(true)}
                    onBlur={() => setTimeout(() => setShowAreaDropdown(false), 200)}
                  />
                  {showAreaDropdown && filteredAreas.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredAreas.slice(0, 50).map((area, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={() => selectArea(area)}
                        >
                          <div className="font-medium">{area.area}</div>
                          <div className="text-sm text-gray-500">{area.pincode}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_method">Contact Method</Label>
                <Select value={formData.contact_method} onValueChange={(value) => handleInputChange('contact_method', value)}>
                  <SelectTrigger id="contact_method">
                    <SelectValue placeholder="How did they contact us?" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/enquiries">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Enquiry'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
