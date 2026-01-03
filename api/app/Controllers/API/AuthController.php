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
        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required',
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $credentials = [
            'email'    => $this->request->getJsonVar('email'),
            'password' => $this->request->getJsonVar('password'),
        ];

        $authenticator = auth('tokens')->getAuthenticator();

        $result = $authenticator->attempt($credentials);

        if (!$result->isOK()) {
            return $this->failUnauthorized($result->reason());
        }

        $user = $authenticator->getUser();

        // Generate access token
        $token = $user->generateAccessToken('api_token');

        return $this->respond([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id'       => $user->id,
                    'username' => $user->username,
                    'email'    => $user->email,
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
