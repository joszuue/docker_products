'use client';

import React, { useRef, useState, useEffect } from 'react';

interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  existingImagesCount?: number;
}

interface PreviewItem {
  file: File;
  previewUrl: string;
}

export default function ImageUploader({
  files,
  onFilesChange,
  maxFiles = 5,
  existingImagesCount = 0,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = Math.max(0, maxFiles - existingImagesCount);

  // Generar URLs de objeto para previsualización y revocarlas cuando cambien
  useEffect(() => {
    const newPreviews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [files]);

  const validateAndAddFiles = (selectedFiles: FileList | File[]) => {
    setErrorMessage(null);
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    const filesArray = Array.from(selectedFiles);
    const newValidFiles: File[] = [];

    for (const file of filesArray) {
      if (!validExtensions.includes(file.type.toLowerCase())) {
        setErrorMessage(`"${file.name}" no es válido. Solo se admiten imágenes JPEG, PNG o WebP.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage(`"${file.name}" supera el límite de 5 MB.`);
        return;
      }

      newValidFiles.push(file);
    }

    const totalAfterAdd = files.length + newValidFiles.length;
    if (totalAfterAdd > remainingSlots) {
      setErrorMessage(
        `Límite excedido. Solo puedes agregar hasta ${remainingSlots} imagen(es) más (máximo ${maxFiles} en total).`
      );
      return;
    }

    onFilesChange([...files, ...newValidFiles]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    // Reiniciar input para permitir seleccionar el mismo archivo si fue eliminado
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setErrorMessage(null);
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          Imágenes del Producto
        </label>
        <span className="text-xs text-slate-500">
          {existingImagesCount + files.length} de {maxFiles} permitidas (máx. 5 MB c/u)
        </span>
      </div>

      {errorMessage && (
        <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center space-x-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Zona de subida */}
      {remainingSlots - files.length > 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">
              <span className="text-indigo-600 group-hover:underline">Haz clic para seleccionar imágenes</span> o arrástralas aquí
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Formatos soportados: JPEG, PNG o WebP (hasta 5 MB por archivo)
            </p>
          </div>
        </div>
      )}

      {/* Previsualización de imágenes nuevas seleccionadas */}
      {previews.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">
            Nuevas imágenes a cargar ({previews.length}):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {previews.map((item, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs aspect-square"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt={`Previsualización ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Quitar imagen"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[10px] px-1.5 py-0.5 truncate">
                  {item.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

