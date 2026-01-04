<?php

namespace App\Models;

use CodeIgniter\Model;

class PatientModel extends Model
{
    protected $table            = 'patients';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'patient_code',
        'name',
        'email',
        'phone',
        'alternate_phone',
        'date_of_birth',
        'gender',
        'address',
        'area',
        'pincode',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'medical_history',
        'current_medications',
        'allergies',
        'source_enquiry_id',
        'status',
        'notes',
        'created_by',
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [];
    protected array $castHandlers = [];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [
        'name'         => 'required|min_length[2]|max_length[255]',
        'phone'        => 'required|min_length[10]|max_length[20]',
        'email'        => 'permit_empty|valid_email|max_length[255]',
        'patient_code' => 'permit_empty|is_unique[patients.patient_code,id,{id}]',
        'status'       => 'permit_empty|in_list[active,inactive,archived]',
    ];

    protected $validationMessages = [
        'name' => [
            'required'   => 'Patient name is required',
            'min_length' => 'Name must be at least 2 characters',
        ],
        'phone' => [
            'required'   => 'Phone number is required',
            'min_length' => 'Phone number must be at least 10 digits',
        ],
        'email' => [
            'valid_email' => 'Please provide a valid email address',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['generatePatientCode'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * Generate unique patient code before insert
     */
    protected function generatePatientCode(array $data)
    {
        if (empty($data['data']['patient_code'])) {
            // Get the last patient code
            $lastPatient = $this->orderBy('id', 'DESC')->first();
            
            if ($lastPatient && !empty($lastPatient['patient_code'])) {
                // Extract number from last code (e.g., CPC-001 -> 001)
                preg_match('/CPC-(\d+)/', $lastPatient['patient_code'], $matches);
                $lastNumber = isset($matches[1]) ? (int)$matches[1] : 0;
            } else {
                $lastNumber = 0;
            }
            
            // Generate new code
            $newNumber = $lastNumber + 1;
            $data['data']['patient_code'] = 'CPC-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
        }
        
        return $data;
    }

    /**
     * Search patients by name, phone, email, or patient code
     */
    public function search(string $query, int $limit = 20, int $offset = 0)
    {
        return $this->groupStart()
                    ->like('name', $query)
                    ->orLike('phone', $query)
                    ->orLike('email', $query)
                    ->orLike('patient_code', $query)
                    ->groupEnd()
                    ->orderBy('created_at', 'DESC')
                    ->findAll($limit, $offset);
    }

    /**
     * Create patient from enquiry data
     */
    public function createPatientFromEnquiry(array $enquiryData): ?int
    {
        $patientData = [
            'name'              => $enquiryData['name'],
            'email'             => $enquiryData['email'] ?? null,
            'phone'             => $enquiryData['phone'],
            'area'              => $enquiryData['area'] ?? null,
            'pincode'           => $enquiryData['pincode'] ?? null,
            'source_enquiry_id' => $enquiryData['id'],
            'notes'             => $enquiryData['notes'] ?? null,
            'status'            => 'active',
            'created_by'        => $enquiryData['created_by'] ?? null,
        ];

        if ($this->insert($patientData)) {
            return $this->getInsertID();
        }

        return null;
    }
}
