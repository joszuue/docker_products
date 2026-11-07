<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'path',
        'position',
    ];

    protected $appends = [
        'url',
    ];

    /**
     * Get the product that owns the image.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the publicly accessible URL for the image.
     */
    public function getUrlAttribute(): string
    {
        if (empty($this->path)) {
            return '';
        }

        // Return public URL via Laravel Storage disk 'public'
        return Storage::disk('public')->url($this->path);
    }
}

