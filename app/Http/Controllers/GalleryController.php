<?php

namespace App\Http\Controllers;

use App\Helpers\Uploader;
use App\Models\Illustration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class GalleryController extends Controller
{
    protected $validations;
    private $_limit;

    public function __construct()
    {
        $this->validations = [
            'name' => 'required',
            'resize' => '',
            'config' => '',
            'image' => 'required|image|mimes:webp,jpeg,png,jpg,gif,svg|max:2048',
        ];
        $this->_limit = 250;
    }

    public function index(Request $request)
    {
        // Restrict to user's images only
        if ($request->input('user') != 'all') {
            $images = Illustration::where('user_id', Auth::user()->id)
            ->orderBy('id', 'desc')
            // ->take($this->_limit)
            // ->get();
            ->paginate(25);
        } else {
            $images = Illustration::take($this->_limit)
            ->orderBy('id', 'desc')
            ->paginate(25);
        }
        return response()->json(['response' => $images]);
    }

    public function store(Request $request)
    {
        // Validate the incoming request data
        $postData = $request->validate($this->validations);

        if ($request->hasFile('image')) {
            // File exists
            $file = $request->file('image');

            // Generate unique file names for image and thumbnail
            $imageName = uniqid() . '.' . $file->getClientOriginalExtension();
            $thumbnailName = uniqid() . '.' . $file->getClientOriginalExtension();

            // Define the upload directory paths
            $uploadPath = 'private/images/uploads/';
            $thumbnailPath = 'private/images/uploads/thumbnails/';

            // Ensure directories exist, create if not
            if (!Storage::exists($uploadPath)) {
                Storage::makeDirectory($uploadPath, 0755, true); // Public visibility
            }
            if (!Storage::exists($thumbnailPath)) {
                Storage::makeDirectory($thumbnailPath, 0755, true); // Public visibility
            }

            $image = Image::read($file);
            // Resize if needed
            $maxWidth = 1920; // Set your max width
            $maxHeight = 1080; // Set your max height

            // Check if the image is larger than the max size and resize it
            if ($image->width() > $maxWidth || $image->height() > $maxHeight) {
                $image->resize($maxWidth, $maxHeight, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            // Apply custom resize if provided
            if (isset($postData['resize'])) {
                $resizeData = json_decode($postData['resize']);
                $image->resize($resizeData->width, $resizeData->height);
            }

            // Store the resized image in private directory
            $imagePath = $uploadPath . $imageName;
            Storage::put($imagePath, (string) $image->encode());

            // Create and save thumbnail
            $thumbnail = $image->resize(150, 150, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });

            $thumbnailPath = $thumbnailPath . $thumbnailName;
            Storage::put($thumbnailPath, (string) $thumbnail->encode());
        } else {
            return response()->json(['error' => 'No image found to upload'], 404);
        }

        // Save the new image record in the database
        $newImage = new Illustration();
        $newImage->name = $postData['name'];
        $newImage->location = $imagePath;
        $newImage->thumbnail = $thumbnailPath;
        $newImage->url = Storage::url($imagePath);
        $newImage->url_thumbnail = Storage::url($thumbnailPath);
        $newImage->config = $postData['config'] ?? json_encode([]);
        $newImage->user()->associate($request->user());
        $newImage->save();

        return response()->json(['response' => 'created', 'url' => $newImage->url]);
    }

    public function delete(Request $request, $id)
    {
        try {
            // Find the image instance or fail with 404 if not found
            $image_instance = Illustration::findOrFail($id);

            // Check if the authenticated user owns the image
            if ($request->user()->id !== $image_instance->user_id) {
                return response()->json(['error' => 'Unauthorized: You can only delete your own images.'], 401);
            }

            // Delete image from database
            Illustration::destroy($id);

            // Delete image and its thumbnail from storage
            if (Storage::exists($image_instance->location)) {
                Storage::delete([$image_instance->location, $image_instance->thumbnail]);
            } else {
                // Handle case where image files are missing in storage (optional)
                // This block can be omitted if you expect storage files to always exist
                return response()->json(['error' => 'Image files not found in storage.'], 404);
            }

            return response()->json(['response' => 'Image with id '.$id.' deleted successfully.']);
        } catch (\Throwable $th) {
            // Handle any unexpected errors
            return response()->json(['error' => 'Failed to delete image.'], 500);
        }
    }

    public function uploadedImage($filename)
    {
        $path = 'private/images/uploads/' . $filename;
        // Check if the file exists
        if (!Storage::exists($path)) {
            abort(404);
        }

        // Serve the file content with proper headers
        $file = Storage::get($path);
        $type = Storage::mimeType($path);

        return response()->make($file, 200, [
            'Content-Type' => $type,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    public function thumbnailImage($filename)
    {
        $path = 'private/images/uploads/thumbnails/' . $filename;

        // Check if the file exists
        if (!Storage::exists($path)) {
            abort(404);
        }

        // Serve the file content with proper headers
        $file = Storage::get($path);
        $type = Storage::mimeType($path);

        return response()->make($file, 200, [
            'Content-Type' => $type,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }
}
