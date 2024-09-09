<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MwController extends Controller
{
    function privacyPolicy()
    {

        return view('legal.privacy-policy');
    }

    function termOfService()
    {
        return view('legal.term-of-service');
    }
}
