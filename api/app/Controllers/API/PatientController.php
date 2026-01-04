<?php

namespace App\Controllers\API;

use App\Models\PatientModel;
use CodeIgniter\RESTful\ResourceController;

class PatientController extends ResourceController
{
    protected $modelName = 'App\Models\PatientModel';
    protected $format    = 'json';

    /**
     * Get all patients with pagination
     * GET /api/patients
     */
    public function index()
    {
        try {
            $model = new PatientModel();
            
            // Get query parameters
            $page    = $this->request->getGet('page') ?? 1;
            $perPage = $this->request->getGet('per_page') ?? 20;
            $status  = $this->request->getGet('status');
            $search  = $this->request->getGet('search');

            // Build query
            $builder = $model;

            if ($status) {
                $builder = $builder->where('status', $status);
            }

            if ($search) {
                $data = $model->search($search, $perPage, ($page - 1) * $perPage);
                $total = $model->groupStart()
                              ->like('name', $search)
                              ->orLike('phone', $search)
                              ->orLike('email', $search)
                              ->orLike('patient_code', $search)
                              ->groupEnd()
                              ->countAllResults();
            } else {
                $data  = $builder->paginate($perPage, 'default', $page);
                $total = $builder->countAllResults(false);
            }

            $pager = $model->pager;

            return $this->respond([
                'status' => 'success',
                'data'   => $data,
                'pager'  => [
                    'currentPage' => (int)$page,
                    'perPage'     => (int)$perPage,
                    'total'       => $total,
                    'pageCount'   => ceil($total / $perPage),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error fetching patients: ' . $e->getMessage());
        }
    }

    /**
     * Get single patient by ID
     * GET /api/patients/{id}
     */
    public function show($id = null)
    {
        try {
            $model = new PatientModel();
            $data  = $model->find($id);

            if (!$data) {
                return $this->failNotFound('Patient not found');
            }

            return $this->respond([
                'status' => 'success',
                'data'   => $data,
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error fetching patient: ' . $e->getMessage());
        }
    }

    /**
     * Create new patient
     * POST /api/patients
     */
    public function create()
    {
        try {
            $model = new PatientModel();
            $data  = $this->request->getJSON(true);

            // Add created_by if user is authenticated
            // $data['created_by'] = auth()->user()->id ?? null;

            if (!$model->insert($data)) {
                return $this->failValidationErrors($model->errors());
            }

            $insertedId  = $model->getInsertID();
            $insertedData = $model->find($insertedId);

            return $this->respondCreated([
                'status'  => 'success',
                'message' => 'Patient created successfully',
                'data'    => $insertedData,
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error creating patient: ' . $e->getMessage());
        }
    }

    /**
     * Update patient
     * PUT/PATCH /api/patients/{id}
     */
    public function update($id = null)
    {
        try {
            $model = new PatientModel();
            $data  = $this->request->getJSON(true);

            // Check if patient exists
            if (!$model->find($id)) {
                return $this->failNotFound('Patient not found');
            }

            if (!$model->update($id, $data)) {
                return $this->failValidationErrors($model->errors());
            }

            $updatedData = $model->find($id);

            return $this->respond([
                'status'  => 'success',
                'message' => 'Patient updated successfully',
                'data'    => $updatedData,
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error updating patient: ' . $e->getMessage());
        }
    }

    /**
     * Delete patient (soft delete)
     * DELETE /api/patients/{id}
     */
    public function delete($id = null)
    {
        try {
            $model = new PatientModel();

            // Check if patient exists
            if (!$model->find($id)) {
                return $this->failNotFound('Patient not found');
            }

            if (!$model->delete($id)) {
                return $this->failServerError('Failed to delete patient');
            }

            return $this->respondDeleted([
                'status'  => 'success',
                'message' => 'Patient deleted successfully',
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error deleting patient: ' . $e->getMessage());
        }
    }
}
