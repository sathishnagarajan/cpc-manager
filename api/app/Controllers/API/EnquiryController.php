<?php

namespace App\Controllers\API;

use App\Models\EnquiryModel;
use App\Config\ChennaiAreas;
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
            $perPage = $this->request->getGet('per_page') ?? 20;
            $status  = $this->request->getGet('status');
            
            // Get paginated results
            $data = $model->getPaginatedEnquiries((int)$perPage, $status);
            
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
            $data  = $model->getEnquiryById((int)$id);

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

            // Add created_by from authenticated user if available (optional for now)
            if (function_exists('auth') && auth()->loggedIn()) {
                $data['created_by'] = auth()->id();
            }

            $insertId = $model->createEnquiry($data);
            
            if (!$insertId) {
                return $this->failValidationErrors($model->errors());
            }

            $newData = $model->getEnquiryById($insertId);

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
            $enquiry = $model->getEnquiryById((int)$id);
            if (!$enquiry) {
                return $this->failNotFound('Enquiry not found');
            }

            // Check if status is being changed to 'converted'
            $wasConverted = isset($data['status']) && $data['status'] === 'converted' && $enquiry['status'] !== 'converted';

            if (!$model->updateEnquiry((int)$id, $data)) {
                return $this->failValidationErrors($model->errors());
            }

            $updatedData = $model->getEnquiryById((int)$id);

            // If enquiry is being converted, create a patient
            if ($wasConverted && empty($enquiry['converted_to_patient_id'])) {
                $patientId = $this->convertEnquiryToPatient($enquiry, $updatedData);
                
                if ($patientId) {
                    // Update enquiry with patient ID and conversion date
                    $model->updateEnquiry((int)$id, [
                        'converted_to_patient_id' => $patientId,
                        'conversion_date' => date('Y-m-d H:i:s'),
                    ]);
                    
                    $updatedData = $model->getEnquiryById((int)$id);
                }
            }

            // Add patient_id to response if converted
            $responseData = $updatedData;
            if (!empty($updatedData['converted_to_patient_id'])) {
                $responseData['patient_id'] = $updatedData['converted_to_patient_id'];
            }

            return $this->respond([
                'status'  => 'success',
                'message' => 'Enquiry updated successfully',
                'data'    => $responseData,
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error updating enquiry: ' . $e->getMessage());
        }
    }

    /**
     * Convert enquiry to patient
     */
    private function convertEnquiryToPatient(array $enquiry, array $updatedEnquiry): ?int
    {
        try {
            $patientModel = new \App\Models\PatientModel();
            return $patientModel->createPatientFromEnquiry($enquiry);
        } catch (\Exception $e) {
            log_message('error', 'Failed to convert enquiry to patient: ' . $e->getMessage());
            return null;
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
            if (!$model->enquiryExists((int)$id)) {
                return $this->failNotFound('Enquiry not found');
            }

            if (!$model->deleteEnquiry((int)$id)) {
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

    /**
     * Get Chennai areas for autocomplete
     * GET /api/chennai-areas
     */
    public function getChennaiAreas()
    {
        try {
            $query = $this->request->getGet('q');
            
            if ($query) {
                // Search areas
                $areas = ChennaiAreas::searchAreas($query);
            } else {
                // Return all areas
                $areas = ChennaiAreas::getAreas();
            }

            return $this->respond([
                'status' => 'success',
                'data'   => $areas,
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error fetching Chennai areas: ' . $e->getMessage());
        }
    }
}

