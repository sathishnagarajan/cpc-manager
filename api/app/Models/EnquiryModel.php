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
        'age',
        'gender',
        'enquiry_date',
        'complaint',
        'source',
        'status',
        'notes',
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
        'name'         => 'required|max_length[255]',
        'phone'        => 'required|max_length[20]',
        'enquiry_date' => 'required|valid_date',
        'email'        => 'permit_empty|valid_email|max_length[255]',
        'age'          => 'permit_empty|integer|greater_than[0]|less_than[150]',
        'gender'       => 'permit_empty|in_list[male,female,other]',
        'status'       => 'permit_empty|in_list[new,contacted,converted,cancelled]',
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
}
