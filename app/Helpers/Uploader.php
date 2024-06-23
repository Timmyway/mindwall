<?php
namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class Uploader
{
    static function publicUploadImage($file,
        $dest_folder='images',
        $image=['name' => '',
            'resize' => false,
            'width' => 128,
            'height' => 128
        ],
        $compression_rate="75"
    ) {
        // File exists, create Image instance
        $img_file = Image::make($file->getRealPath());
        if ($image['resize']) {
            $img_file->resize($image['width'], $image['height'], function ($constraint) {
                $constraint->aspectRatio();
            });
        }
        $image_path = Uploader::save($file, $img_file, $image, $dest_folder, $compression_rate);
        // Create the thumbnail
        $thumbnail_path = Uploader::makeThumbnail($file, $img_file, $image);
        return ['image_path' => $image_path, 'thumbnail_path' => $thumbnail_path];
    }

    public static function makeThumbnail($file, $img_file, $image)
    {
        $img_file->resize(120, null, function ($constraint) {
            $constraint->aspectRatio();
        });
        // Store thumbnails inside public/storage (symlink) folder
        return Uploader::save($file, $img_file, $image, 'storage/images/thumbnails', 75);
    }

    private static function save($file, $img_file, $image=[
            'name' => '',
            'resize' => false,
            'width' => 128,
            'height' => 128
        ], $dest_folder='images', $compression_rate=75)
    {
        // Create destination folder if not already exists
        if (!file_exists($dest_folder)) {
            mkdir($dest_folder, 0777, true);
        }
        $filename = date('mdY_His').'_'.$file->getClientOriginalName();
        if ($image['name'] != '') {
            $filename = $image['filename'];
        }
        // $filepath = $file->storeAs($destination_path, $filename);
        $dest_path = $dest_folder.'/'.$filename;
        // Get the extension of the image
        $mime = $img_file->mime();
        if ($mime == 'image/gif') {
            $file->storeAs($dest_folder, $filename, 'public');
            return env('APP_UPLOAD_FOLDER').'/'.$dest_path;
        } else {
            $img_file->save($dest_path, $compression_rate);
        }
        return $dest_path;
    }

    static function upload($file, $dest_folder, $visibility='public') {
        // Create destination folder if not already exists
        // if (!file_exists($dest_folder)) {
        //     mkdir($dest_folder, 0777, true);
        // }
        // File exists, create Image instance
        $filename = date('mdY_His').'_'.$file->getClientOriginalName();
        $dest_path = Storage::putFileAs($dest_folder, $file, $filename, 'public');
        return $dest_path;
    }
}
