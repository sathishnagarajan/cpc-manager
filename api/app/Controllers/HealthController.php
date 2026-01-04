<?php
namespace App\Controllers;

class HealthController extends BaseController
{
    public function index()
    {
        return $this->response->setJSON([
            'status' => 'ok',
            'timestamp' => date('Y-m-d H:i:s'),
            'environment' => ENVIRONMENT
        ]);
    }
}
