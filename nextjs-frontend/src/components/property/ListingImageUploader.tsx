"use client";

import { useState, useEffect } from "react";
import { uploadListingImage, deleteListingImage, fetchListingImages, propertyImageUrl } from "@/lib/property-api";

interface ListingImageUploaderProps {
  listingId: number | null;
}

export default function ListingImageUploader({ listingId }: ListingImageUploaderProps) {
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadImages = async () => {
    if (!listingId) return;
    try {
      const data = await fetchListingImages(listingId);
      setImages(data);
    } catch (err) {
      console.error("Failed to load images", err);
    }
  };

  useEffect(() => {
    loadImages();
  }, [listingId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !listingId) return;

    // Client-side validation (Page 14 of Production Plan)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      await uploadListingImage(listingId, file, images.length === 0);
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!listingId) return;
    try {
      await deleteListingImage(listingId, imageId);
      await loadImages();
    } catch (err) {
      setError("Delete failed");
    }
  };

  if (!listingId) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500 italic">
        Please save the listing as a draft first to enable image uploads.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={propertyImageUrl(img.public_url)} 
              alt={img.alt_text || "Property Image"} 
              className="h-full w-full object-cover"
            />
            {img.is_cover && (
              <span className="absolute left-2 top-2 rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                COVER
              </span>
            )}
            <button 
              onClick={() => handleDelete(img.id)}
              className="absolute right-2 top-2 hidden rounded-full bg-red-600 p-1.5 text-white shadow-sm group-hover:block hover:bg-red-700"
              title="Delete Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        
        {images.length < 10 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:bg-gray-50">
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-green border-t-transparent"></div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="mt-1 text-xs font-medium text-gray-500">Add Photo</span>
              </>
            )}
          </label>
        )}
      </div>
      
      <p className="text-[11px] text-gray-500 italic">
        * First image will be used as the cover photo. Max 10 images, 5MB each.
      </p>
    </div>
  );
}
