// Enquiry types for CPC Manager
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

export const ENQUIRY_STATUS = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-500' },
  { value: 'converted', label: 'Converted', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500' },
];
