<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

service('auth')->routes($routes);

// API Routes
$routes->group('api', ['namespace' => 'App\Controllers\API'], function ($routes) {
    // Auth routes (no authentication required)
    $routes->post('auth/login', 'AuthController::login');
    
    // Protected routes (require authentication)
    $routes->group('', ['filter' => 'tokens'], function ($routes) {
        // Auth
        $routes->post('auth/logout', 'AuthController::logout');
        $routes->get('auth/me', 'AuthController::me');
        
        // Enquiries
        $routes->resource('enquiries', [
            'controller' => 'EnquiryController',
            'except'     => 'new,edit',
        ]);
    });
});
