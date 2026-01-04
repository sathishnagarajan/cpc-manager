"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ENQUIRY_STATUS, ENQUIRY_TYPES, VISIT_TYPES, CONTACT_METHODS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

interface Enquiry {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  enquiry_date?: string;
  enquiry_type?: string;
  area?: string;
  pincode?: string;
  visit_type?: 'clinic' | 'home_visit';
  contact_method?: 'phone' | 'email' | 'walk_in';
  status?: 'new' | 'contacted' | 'scheduled' | 'converted' | 'cancelled' | 'completed';
  notes?: string;
}

interface EditEnquiryModalProps {
  enquiry: Enquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, data: Partial<Enquiry>) => Promise<void>;
}

export function EditEnquiryModal({ enquiry, open, onOpenChange, onSave }: EditEnquiryModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Enquiry>>({});

  useEffect(() => {
    if (enquiry) {
      setFormData({
        name: enquiry.name || '',
        phone: enquiry.phone || '',
        email: enquiry.email || '',
        enquiry_type: enquiry.enquiry_type || '',
        area: enquiry.area || '',
        pincode: enquiry.pincode || '',
        visit_type: enquiry.visit_type || 'clinic',
        contact_method: enquiry.contact_method || 'phone',
        status: enquiry.status || 'new',
        notes: enquiry.notes || '',
      });
    }
  }, [enquiry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry?.id) return;

    try {
      setSaving(true);
      await onSave(enquiry.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save enquiry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Enquiry</DialogTitle>
          <DialogDescription>
            Update enquiry details and status
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enquiry_type">Enquiry Type</Label>
              <Select
                value={formData.enquiry_type || ''}
                onValueChange={(value) => handleChange('enquiry_type', value)}
              >
                <SelectTrigger id="enquiry_type">
                  <SelectValue placeholder="Select type" />
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
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                value={formData.area || ''}
                onChange={(e) => handleChange('area', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode || ''}
                onChange={(e) => handleChange('pincode', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit_type">Visit Type</Label>
              <Select
                value={formData.visit_type || 'clinic'}
                onValueChange={(value) => handleChange('visit_type', value)}
              >
                <SelectTrigger id="visit_type">
                  <SelectValue />
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

            <div className="space-y-2">
              <Label htmlFor="contact_method">Contact Method</Label>
              <Select
                value={formData.contact_method || 'phone'}
                onValueChange={(value) => handleChange('contact_method', value)}
              >
                <SelectTrigger id="contact_method">
                  <SelectValue />
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status || 'new'}
                onValueChange={(value) => handleChange('status', value)}
                required
              >
                <SelectTrigger id="status">
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
