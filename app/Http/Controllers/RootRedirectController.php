<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class RootRedirectController extends Controller
{
    public function __invoke(): RedirectResponse
    {
        return Auth::check()
            ? redirect()->route('dashboard')
            : redirect()->route('login');
    }
}
