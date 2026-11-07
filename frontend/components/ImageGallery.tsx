'use client';

import { useState } from 'react';
import { ProductImage } from '@/lib/types';
import { resolveImageUrl } from '@/lib/api';

interface ImageGalleryProps {
  images?: ProductImage[];
  productName: string;
  onDeleteImage?: (imageId: number) => Promise<void>;
  isEditable?: boolean;
}

export default function ImageGallery({
  images = [],
  productName,
  onDeleteImage,
  isEditable = false,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 aspect-video flex flex-col items-center justify-center p-6 text-slate-400">
        <svg className="w-16 h-16 mb-2 stroke-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium">Sin imágenes asociadas</span>
      </div>
    );
  }

  const activeImage = images[selectedIndex] || images[0];

  const handleDelete = async (e: React.MouseEvent, imageId: number) => {
    e.stopPropagation();
    if (!onDeleteImage) return;

    if (!confirm('¿Deseas eliminar esta imagen de forma permanente?')) {
      return;
    }

    try {
      setDeletingId(imageId);
      await onDeleteImage(imageId);
      if (selectedIndex >= images.length - 1 && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Imagen Principal */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white aspect-4/3 max-h-[460px] flex items-center justify-center shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImageUrl(activeImage?.url || activeImage?.path)}
          alt={`${productName} - Imagen ${selectedIndex + 1}`}
          className="w-full h-full object-contain"
        />

        <div className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-100 scale-95'
                    : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(img.url || img.path)}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {isEditable && onDeleteImage && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, img.id)}
                    disabled={deletingId === img.id}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                    title="Eliminar imagen"
                  >
                    {deletingId === img.id ? (
                      <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Si es editable y solo hay 1 imagen, permitir eliminarla también */}
      {isEditable && images.length === 1 && onDeleteImage && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={(e) => handleDelete(e, images[0].id)}
            disabled={deletingId === images[0].id}
            className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Eliminar esta imagen</span>
          </button>
        </div>
      )}
    </div>
  );
}
