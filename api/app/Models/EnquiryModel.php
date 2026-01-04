<?php

namespace App\Models;

use CodeIgniter\Model;

class EnquiryModel extends Model
{
    protected $table            = 'enquiries';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'name',
        'email',
        'phone',
        'enquiry_date',
        'enquiry_type',
        'area',
        'pincode',
        'visit_type',
        'contact_method',
        'status',
        'notes',
        'converted_to_patient_id',
        'conversion_date',
        'created_by',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [
        'name'                     => 'required|max_length[255]',
        'phone'                    => 'required|max_length[20]',
        'enquiry_date'             => 'required|valid_date',
        'email'                    => 'permit_empty|valid_email|max_length[255]',
        'enquiry_type'             => 'permit_empty|max_length[100]',
        'area'                     => 'permit_empty|max_length[100]',
        'pincode'                  => 'permit_empty|max_length[10]',
        'visit_type'               => 'permit_empty|in_list[clinic,home_visit]',
        'contact_method'           => 'permit_empty|in_list[phone,email,walk_in]',
        'status'                   => 'permit_empty|in_list[new,contacted,scheduled,converted,cancelled,completed]',
        'converted_to_patient_id'  => 'permit_empty|integer',
        'conversion_date'          => 'permit_empty|valid_date',
    ];

    protected $validationMessages = [
        'name' => [
            'required' => 'Name is required',
        ],
        'phone' => [
            'required' => 'Phone number is required',
        ],
        'enquiry_date' => [
            'required'   => 'Enquiry date is required',
            'valid_date' => 'Please enter a valid date',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * Get paginated enquiries with optional status filter
     */
    public function getPaginatedEnquiries(int $perPage = 20, ?string $status = null): array
    {
        if ($status) {
            $this->where('status', $status);
        }
        
        return $this->orderBy('enquiry_date', 'DESC')->paginate($perPage);
    }

    /**
     * Get enquiry by ID
     */
    public function getEnquiryById(int $id): ?array
    {
        return $this->find($id);
    }

    /**
     * Create new enquiry and return the ID
     */
    public function createEnquiry(array $data): ?int
    {
        if ($this->save($data)) {
            return $this->getInsertID();
        }
        
        return null;
    }

    /**
     * Update enquiry by ID
     */
    public function updateEnquiry(int $id, array $data): bool
    {
        return $this->update($id, $data);
    }

    /**
     * Delete enquiry by ID (soft delete)
     */
    public function deleteEnquiry(int $id): bool
    {
        return $this->delete($id);
    }

    /**
     * Check if enquiry exists
     */
    public function enquiryExists(int $id): bool
    {
        return $this->find($id) !== null;
    }
}
