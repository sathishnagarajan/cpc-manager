<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->get('health', 'HealthController::index');

service('auth')->routes($routes);

// API Routes
$routes->group('api', ['namespace' => 'App\Controllers\API'], function ($routes) {
    // Handle OPTIONS requests for CORS preflight
    $routes->options('(:any)', function() {
        $response = service('response');
        $response->setStatusCode(200);
        return $response;
    });
    
    // Test route
    $routes->get('test', function() {
        return service('response')->setJSON(['message' => 'API is working']);
    });
    
    // Auth routes (no authentication required)
    $routes->post('auth/login', 'AuthController::login');
    
    // Temporarily unprotected routes for testing
    // TODO: Add back ['filter' => 'tokens'] when authentication is ready
    
    // Enquiries - temporarily unprotected
    $routes->resource('enquiries', [
        'controller' => 'EnquiryController',
        'except'     => 'new,edit',
    ]);
    
    // Patients - temporarily unprotected
    $routes->resource('patients', [
        'controller' => 'PatientController',
        'except'     => 'new,edit',
    ]);
    
    // Users (admin only) - protected with token authentication
    $routes->resource('users', [
        'controller' => 'UserController',
        'except'     => 'new,edit',
        'filter'     => 'tokens',
    ]);
    
    // Get Chennai areas
    $routes->get('chennai-areas', 'EnquiryController::getChennaiAreas');
    
    // Auth endpoints
    $routes->post('auth/logout', 'AuthController::logout');
    $routes->get('auth/me', 'AuthController::me');
});
