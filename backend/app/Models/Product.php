<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
    ];

    protected $appends = [
        'thumbnail_url',
    ];

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the images for the product, sorted by position.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position', 'asc')->orderBy('id', 'asc');
    }

    /**
     * Get the URL of the first image or null.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        $firstImage = $this->images->first();
        return $firstImage ? $firstImage->url : null;
    }
}
