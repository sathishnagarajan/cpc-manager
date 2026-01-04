export interface Enquiry {
  id?: number;
  name: string;
  email?: string;
  phone: string;
  enquiry_date: string;
  enquiry_type?: string;
  area?: string;
  pincode?: string;
  visit_type?: 'clinic' | 'home_visit';
  contact_method?: 'phone' | 'email' | 'walk_in';
  status?: 'new' | 'contacted' | 'scheduled' | 'converted' | 'cancelled' | 'completed';
  notes?: string;
  converted_to_patient_id?: number;
  conversion_date?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChennaiArea {
  area: string;
  pincode: string;
}

export interface EnquiryFormData {
  name: string;
  email: string;
  phone: string;
  enquiry_date: string;
  enquiry_type: string;
  area: string;
  pincode: string;
  visit_type: string;
  contact_method: string;
  notes: string;
}

export const ENQUIRY_TYPES = [
  // Medical/Physiotherapy Enquiries
  { value: 'back_pain', label: 'Back Pain' },
  { value: 'neck_pain', label: 'Neck Pain' },
  { value: 'shoulder_pain', label: 'Shoulder Pain' },
  { value: 'knee_pain', label: 'Knee Pain' },
  { value: 'leg_pain', label: 'Leg Pain' },
  { value: 'hip_pain', label: 'Hip Pain' },
  { value: 'ankle_pain', label: 'Ankle Pain' },
  { value: 'sports_injury', label: 'Sports Injury' },
  { value: 'stroke_rehabilitation', label: 'Stroke Rehabilitation' },
  { value: 'post_surgery', label: 'Post-Surgery Rehabilitation' },
  { value: 'laser_treatment', label: 'Laser Treatment' },
  { value: 'consultation', label: 'General Consultation' },
  
  // Non-Medical Enquiries
  { value: 'marketing', label: 'Marketing Enquiry' },
  { value: 'career', label: 'Career Enquiry' },
  { value: 'general', label: 'General Enquiry' },
];

export const VISIT_TYPES = [
  { value: 'clinic', label: 'Clinic Visit' },
  { value: 'home_visit', label: 'Home Visit' },
];

export const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'walk_in', label: 'Walk-in' },
];

export const ENQUIRY_STATUSES = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'scheduled', label: 'Scheduled', color: 'purple' },
  { value: 'converted', label: 'Converted', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];
