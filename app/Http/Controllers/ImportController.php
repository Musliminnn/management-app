<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Imports\SubKegiatanImport;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
   public function import(Request $request)
{
    $request->validate([
        'file' => 'required|file|mimes:xlsx,xls',
    ]);

    Excel::import(new SubKegiatanImport, $request->file('file'));

    return back()->with('success', 'Data berhasil diimport!');
}
}
