<?php

namespace App\Policies;

use App\Helpers\General\LogHelper;
use App\Models\Thematic;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ThematicPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        //
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Thematic $thematic): bool
    {
        return $user->id === $thematic->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        //
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Thematic $thematic): bool
    {
        LogHelper::debug('Can update: '.json_encode($user->id == $thematic->user_id));
        return $user->id == $thematic->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Thematic $thematic): bool
    {
        //
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Thematic $thematic): bool
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Thematic $thematic): bool
    {
        //
    }
}
