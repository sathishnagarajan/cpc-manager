'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus, Search, Edit, Phone, Mail } from 'lucide-react';
import { apiService } from '@/lib/api';
import { ENQUIRY_STATUS, ENQUIRY_TYPES } from '@/lib/constants';
import { EditEnquiryModal } from '@/components/edit-enquiry-modal';
import { useToast } from '@/hooks/use-toast';

interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email?: string;
  enquiry_date: string;
  enquiry_type?: string;
  area?: string;
  visit_type?: 'clinic' | 'home_visit';
  contact_method?: 'phone' | 'email' | 'walk_in';
  status: 'new' | 'contacted' | 'scheduled' | 'converted' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const loadEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        per_page: 20,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await apiService.getEnquiries(params);
      
      if (response.status === 'success') {
        setEnquiries(response.data || []);
        if (response.pager) {
          setTotalPages(response.pager.pageCount || 1);
        }
      }
    } catch (error) {
      console.error('Failed to load enquiries:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  const getEnquiryTypeLabel = (value?: string) => {
    if (!value) return '-';
    const type = ENQUIRY_TYPES.find(t => t.value === value);
    return type ? type.label : value;
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      enquiry.name.toLowerCase().includes(search) ||
      enquiry.phone.includes(search) ||
      enquiry.email?.toLowerCase().includes(search) ||
      enquiry.area?.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEditClick = (enquiry: Enquiry) => {
    setEditingEnquiry(enquiry);
    setIsEditModalOpen(true);
  };

  const handleSaveEnquiry = async (id: number, data: Partial<Enquiry>) => {
    try {
      const response = await apiService.updateEnquiry(id, data);
      if (response.status === 'success') {
        // Check if converted to patient
        if (response.data.patient_id) {
          toast({
            title: "Success",
            description: `Enquiry converted to patient successfully! Patient ID: CPC-${String(response.data.patient_id).padStart(3, '0')}`,
          });
        } else {
          toast({
            title: "Success",
            description: "Enquiry updated successfully",
          });
        }
        loadEnquiries();
      }
    } catch (error) {
      console.error('Failed to update enquiry:', error);
      toast({
        title: "Error",
        description: "Failed to update enquiry",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (enquiryId: number, newStatus: string) => {
    try {
      const response = await apiService.updateEnquiry(enquiryId, { status: newStatus });
      if (response.status === 'success') {
        // Check if converted to patient
        if (newStatus === 'converted' && response.data.patient_id) {
          toast({
            title: "Converted!",
            description: `Patient created successfully! Patient ID: CPC-${String(response.data.patient_id).padStart(3, '0')}`,
          });
        } else {
          toast({
            title: "Status Updated",
            description: "Enquiry status changed successfully",
          });
        }
        loadEnquiries();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Enquiries</h1>
        <Link href="/enquiries/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Enquiry
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search enquiries..."
              className="w-full rounded-md border border-input pl-8 md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Enquiries</SelectItem>
              {ENQUIRY_STATUS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No enquiries found. Create your first enquiry to get started.
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y">
              {filteredEnquiries.map((enquiry) => (
                <Card key={enquiry.id} className="p-4 border-0 rounded-none">
                  <div className="space-y-3">
                    {/* Header with name and edit button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{enquiry.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Select
                            value={enquiry.status}
                            onValueChange={(value) => handleStatusChange(enquiry.id, value)}
                          >
                            <SelectTrigger className="h-7 w-auto text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ENQUIRY_STATUS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(enquiry)}
                        className="h-8 w-8 -mr-2 flex-shrink-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{enquiry.phone}</span>
                      </div>
                      {enquiry.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">{enquiry.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {enquiry.enquiry_type && (
                        <Badge variant="outline">
                          {getEnquiryTypeLabel(enquiry.enquiry_type)}
                        </Badge>
                      )}
                      {enquiry.area && (
                        <Badge variant="outline">{enquiry.area}</Badge>
                      )}
                      {enquiry.visit_type && (
                        <Badge variant="secondary">
                          {enquiry.visit_type === 'clinic' ? 'Clinic' : 'Home Visit'}
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatDate(enquiry.enquiry_date)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Area</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Visit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (filteredEnquiries.length > 0) {
                            handleEditClick(filteredEnquiries[0]);
                          }
                        }}
                        className="h-8"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{enquiry.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm">{enquiry.phone}</span>
                          {enquiry.email && (
                            <span className="text-xs text-muted-foreground">{enquiry.email}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{getEnquiryTypeLabel(enquiry.enquiry_type)}</td>
                      <td className="px-4 py-3 text-sm">{enquiry.area || '-'}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(enquiry.enquiry_date)}</td>
                      <td className="px-4 py-3">
                        {enquiry.visit_type ? (
                          <Badge variant="outline" className="text-xs">
                            {enquiry.visit_type === 'clinic' ? 'Clinic' : 'Home'}
                          </Badge>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={enquiry.status}
                          onValueChange={(value) => handleStatusChange(enquiry.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ENQUIRY_STATUS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(enquiry)}
                          className="h-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {!loading && filteredEnquiries.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <EditEnquiryModal
        enquiry={editingEnquiry}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleSaveEnquiry}
      />
    </div>
  );
}
