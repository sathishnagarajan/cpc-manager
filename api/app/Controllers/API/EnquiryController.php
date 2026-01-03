<?php

namespace App\Controllers\API;

use App\Models\EnquiryModel;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Shield\Entities\User;

class EnquiryController extends ResourceController
{
    protected $modelName = 'App\Models\EnquiryModel';
    protected $format    = 'json';

    /**
     * Get all enquiries
     * GET /api/enquiries
     */
    public function index()
    {
        try {
            $model = new EnquiryModel();
            
            // Get pagination parameters
            $page    = $this->request->getGet('page') ?? 1;
            $perPage = $this->request->getGet('per_page') ?? 20;
            $status  = $this->request->getGet('status');
            
            $builder = $model->builder();
            
            // Filter by status if provided
            if ($status) {
                $builder->where('status', $status);
            }
            
            // Get paginated results
            $data = $model->orderBy('enquiry_date', 'DESC')
                          ->paginate($perPage);
            
            return $this->respond([
                'status'  => 'success',
                'data'    => $data,
                'pager'   => $model->pager->getDetails(),
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error fetching enquiries: ' . $e->getMessage());
        }
    }

    /**
     * Get single enquiry
     * GET /api/enquiries/{id}
     */
    public function show($id = null)
    {
        try {
            $model = new EnquiryModel();
            $data  = $model->find($id);

            if (!$data) {
                return $this->failNotFound('Enquiry not found');
            }

            return $this->respond([
                'status' => 'success',
                'data'   => $data,
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error fetching enquiry: ' . $e->getMessage());
        }
    }

    /**
     * Create new enquiry
     * POST /api/enquiries
     */
    public function create()
    {
        try {
            $model = new EnquiryModel();
            $data  = $this->request->getJSON(true);

            // Add created_by from authenticated user if available
            if (auth()->loggedIn()) {
                $data['created_by'] = auth()->id();
            }

            if (!$model->save($data)) {
                return $this->failValidationErrors($model->errors());
            }

            $insertId = $model->getInsertID();
            $newData  = $model->find($insertId);

            return $this->respondCreated([
                'status'  => 'success',
                'message' => 'Enquiry created successfully',
                'data'    => $newData,
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error creating enquiry: ' . $e->getMessage());
        }
    }

    /**
     * Update enquiry
     * PUT/PATCH /api/enquiries/{id}
     */
    public function update($id = null)
    {
        try {
            $model = new EnquiryModel();
            $data  = $this->request->getJSON(true);

            // Check if enquiry exists
            if (!$model->find($id)) {
                return $this->failNotFound('Enquiry not found');
            }

            if (!$model->update($id, $data)) {
                return $this->failValidationErrors($model->errors());
            }

            $updatedData = $model->find($id);

            return $this->respond([
                'status'  => 'success',
                'message' => 'Enquiry updated successfully',
                'data'    => $updatedData,
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error updating enquiry: ' . $e->getMessage());
        }
    }

    /**
     * Delete enquiry (soft delete)
     * DELETE /api/enquiries/{id}
     */
    public function delete($id = null)
    {
        try {
            $model = new EnquiryModel();

            // Check if enquiry exists
            if (!$model->find($id)) {
                return $this->failNotFound('Enquiry not found');
            }

            if (!$model->delete($id)) {
                return $this->failServerError('Failed to delete enquiry');
            }

            return $this->respondDeleted([
                'status'  => 'success',
                'message' => 'Enquiry deleted successfully',
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error deleting enquiry: ' . $e->getMessage());
        }
    }
}
