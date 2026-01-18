<?php

namespace App\Controllers\API;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\Shield\Models\UserModel;
use CodeIgniter\Shield\Entities\User;

class UserController extends ResourceController
{
    protected $format = 'json';

    /**
     * Get all users
     * GET /api/users
     */
    public function index()
    {
        try {
            // Check if user is admin
            if (!$this->isAdmin()) {
                return $this->failForbidden('Admin access required');
            }

            $model = new UserModel();
            
            // Get pagination parameters
            $perPage = $this->request->getGet('per_page') ?? 20;
            $group   = $this->request->getGet('group');
            
            // Get users with pagination
            if ($group) {
                $model->select('users.*, auth_groups_users.group')
                      ->join('auth_groups_users', 'auth_groups_users.user_id = users.id', 'left')
                      ->where('auth_groups_users.group', $group);
            } else {
                $model->select('users.*, auth_groups_users.group')
                      ->join('auth_groups_users', 'auth_groups_users.user_id = users.id', 'left');
            }
            
            $users = $model->paginate((int)$perPage);
            
            // Format user data
            $formattedUsers = array_map(function ($user) {
                return [
                    'id'         => $user->id,
                    'username'   => $user->username,
                    'email'      => $user->email ?? $this->getEmail($user->id),
                    'active'     => $user->active == 1,
                    'groups'     => $this->getUserGroups($user->id),
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            }, $users);
            
            return $this->respond([
                'status' => 'success',
                'data'   => $formattedUsers,
                'pager'  => [
                    'currentPage' => $model->pager->getCurrentPage(),
                    'perPage'     => $model->pager->getPerPage(),
                    'total'       => $model->pager->getTotal(),
                    'pageCount'   => $model->pager->getPageCount(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error fetching users: ' . $e->getMessage());
        }
    }

    /**
     * Get single user
     * GET /api/users/{id}
     */
    public function show($id = null)
    {
        try {
            if (!$this->isAdmin()) {
                return $this->failForbidden('Admin access required');
            }

            $model = new UserModel();
            $user  = $model->find($id);

            if (!$user) {
                return $this->failNotFound('User not found');
            }

            return $this->respond([
                'status' => 'success',
                'data'   => [
                    'id'       => $user->id,
                    'username' => $user->username,
                    'email'    => $this->getEmail($user->id),
                    'active'   => $user->active == 1,
                    'groups'   => $user->getGroups(),
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error fetching user: ' . $e->getMessage());
        }
    }

    /**
     * Create new user
     * POST /api/users
     */
    public function create()
    {
        try {
            if (!$this->isAdmin()) {
                return $this->failForbidden('Admin access required');
            }

            $data = $this->request->getJSON(true);

            // Validate required fields
            if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
                return $this->failValidationErrors('Username, email, and password are required');
            }

            $users = auth()->getProvider();

            // Create user with email and password
            $user = new User([
                'username' => $data['username'],
                'email'    => $data['email'],
                'password' => $data['password'],
            ]);
            
            $users->save($user);

            // Get the user ID
            $user = $users->findById($users->getInsertID());

            // Activate the user
            $user->activate();

            // Add user to group if specified
            if (!empty($data['group'])) {
                $user->addGroup($data['group']);
            }

            return $this->respondCreated([
                'status'  => 'success',
                'message' => 'User created successfully',
                'data'    => [
                    'id'       => $user->id,
                    'username' => $user->username,
                    'email'    => $user->email,
                    'active'   => $user->active == 1,
                    'groups'   => $user->getGroups(),
                ],
            ]);
        } catch (\Exception $e) {
            log_message('error', 'Error creating user: ' . $e->getMessage());
            return $this->failServerError('Error creating user: ' . $e->getMessage());
        }
    }

    /**
     * Update user
     * PUT/PATCH /api/users/{id}
     */
    public function update($id = null)
    {
        try {
            if (!$this->isAdmin()) {
                return $this->failForbidden('Admin access required');
            }

            $model = new UserModel();
            $user  = $model->find($id);

            if (!$user) {
                return $this->failNotFound('User not found');
            }

            $data = $this->request->getJSON(true);

            // Update basic fields
            if (isset($data['username'])) {
                $user->username = $data['username'];
            }

            if (isset($data['active'])) {
                $user->active = $data['active'];
            }

            // Update email if provided
            if (isset($data['email'])) {
                $emailIdentity = $user->getEmailIdentity();
                $emailIdentity->secret = $data['email'];
                $user->saveEmailIdentity($emailIdentity);
            }

            // Update password if provided
            if (!empty($data['password'])) {
                $emailIdentity = $user->getEmailIdentity();
                $emailIdentity->secret2 = $data['password'];
                $user->saveEmailIdentity($emailIdentity);
            }

            // Save user
            if (!$model->save($user)) {
                return $this->failValidationErrors($model->errors());
            }

            // Update group if provided
            if (isset($data['group'])) {
                // Remove existing groups
                $user->syncGroups($data['group']);
            }

            return $this->respond([
                'status'  => 'success',
                'message' => 'User updated successfully',
                'data'    => [
                    'id'       => $user->id,
                    'username' => $user->username,
                    'email'    => $this->getEmail($user->id),
                    'active'   => $user->active == 1,
                    'groups'   => $user->getGroups(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error updating user: ' . $e->getMessage());
        }
    }

    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    public function delete($id = null)
    {
        try {
            if (!$this->isAdmin()) {
                return $this->failForbidden('Admin access required');
            }

            $model = new UserModel();
            $user  = $model->find($id);

            if (!$user) {
                return $this->failNotFound('User not found');
            }

            // Prevent deleting yourself
            if (auth()->id() == $id) {
                return $this->failForbidden('Cannot delete your own account');
            }

            if (!$model->delete($id)) {
                return $this->failServerError('Failed to delete user');
            }

            return $this->respondDeleted([
                'status'  => 'success',
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return $this->failServerError('Error deleting user: ' . $e->getMessage());
        }
    }

    /**
     * Check if current user is admin
     */
    private function isAdmin(): bool
    {
        // First check token authentication
        $authenticator = auth('tokens')->getAuthenticator();
        
        if (!$authenticator->loggedIn()) {
            return false;
        }

        $user = $authenticator->getUser();
        return $user->inGroup('admin') || $user->inGroup('superadmin');
    }

    /**
     * Get user email from identities
     */
    private function getEmail(int $userId): ?string
    {
        $db = \Config\Database::connect();
        $builder = $db->table('auth_identities');
        $identity = $builder->where('user_id', $userId)
                           ->where('type', 'email_password')
                           ->get()
                           ->getRow();
        
        return $identity ? $identity->secret : null;
    }

    /**
     * Get user groups
     */
    private function getUserGroups(int $userId): array
    {
        $db = \Config\Database::connect();
        $builder = $db->table('auth_groups_users');
        $groups = $builder->where('user_id', $userId)
                         ->get()
                         ->getResultArray();
        
        return array_column($groups, 'group');
    }
}
