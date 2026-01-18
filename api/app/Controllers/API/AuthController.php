<?php

namespace App\Controllers\API;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\Shield\Models\UserModel;

class AuthController extends ResourceController
{
    protected $format = 'json';

    /**
     * User login
     * POST /api/auth/login
     */
    public function login()
    {
        log_message('info', 'Login attempt started');
        log_message('info', 'Request body: ' . $this->request->getBody());
        
        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required',
        ];

        if (!$this->validate($rules)) {
            log_message('error', 'Validation failed: ' . json_encode($this->validator->getErrors()));
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $credentials = [
            'email'    => $this->request->getJsonVar('email'),
            'password' => $this->request->getJsonVar('password'),
        ];
        
        log_message('info', 'Attempting authentication for: ' . $credentials['email']);

        // Use session authenticator for login, not tokens
        $authenticator = auth('session')->getAuthenticator();

        $result = $authenticator->attempt($credentials);

        if (!$result->isOK()) {
            log_message('error', 'Authentication failed: ' . $result->reason());
            return $this->failUnauthorized($result->reason());
        }

        // Get authenticated user
        $user = $authenticator->getUser();
        
        log_message('info', 'User authenticated: ' . $user->username);

        // Generate access token
        $token = $user->generateAccessToken('api_token');
        
        log_message('info', 'Token generated successfully');

        return $this->respond([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id'       => $user->id,
                    'username' => $user->username,
                    'email'    => $user->email,
                    'groups'   => $user->getGroups(),
                    'permissions' => $user->getPermissions(),
                ],
                'token' => $token->raw_token,
            ],
        ]);
    }

    /**
     * User logout
     * POST /api/auth/logout
     */
    public function logout()
    {
        if (auth()->loggedIn()) {
            $user = auth()->user();
            $user->revokeAllAccessTokens();

            auth()->logout();
        }

        return $this->respond([
            'status'  => 'success',
            'message' => 'Logout successful',
        ]);
    }

    /**
     * Get current user
     * GET /api/auth/me
     */
    public function me()
    {
        if (!auth()->loggedIn()) {
            return $this->failUnauthorized('Not authenticated');
        }

        $user = auth()->user();

        return $this->respond([
            'status' => 'success',
            'data'   => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
            ],
        ]);
    }
}
