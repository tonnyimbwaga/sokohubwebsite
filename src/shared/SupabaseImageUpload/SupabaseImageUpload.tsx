"use client";

import { useState, useCallback, useEffect } from "react";
import { TbPhotoPlus } from "react-icons/tb";
import imageCompression from "browser-image-compression";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase/client";

// Configuration constants
const MAX_IMAGE_SIZE_MB = 5;
const MIN_IMAGE_QUALITY = 0.6;
const MAX_IMAGE_QUALITY = 0.9;
const TARGET_IMAGE_WIDTH = 1600;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_RETRY_ATTEMPTS = 3;

interface SupabaseImageUploadProps {
  onChange: (value: string) => void;
  value?: string | null;
  bucket?: string;
  path?: string; // Optional subfolder path
}

const SupabaseImageUpload: React.FC<SupabaseImageUploadProps> = ({
  onChange,
  value,
  bucket = "product-images",
  path = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Helper that converts a raw filename (or already-absolute path) into a full public URL
  const getPublicUrlFromValue = useCallback(
    (val: string | null | undefined): string | null => {
      if (!val) return null;
      if (/^https?:\/\//i.test(val)) return val; // already absolute

      const supabaseBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      if (!supabaseBaseUrl) return null;

      // If the incoming value already contains a '/'
      if (val.includes("/")) {
        return `${supabaseBaseUrl}/storage/v1/object/public/${val.startsWith("/") ? val.substring(1) : val}`;
      }

      // Otherwise we treat it as bare filename in the currently configured bucket
      return `${supabaseBaseUrl}/storage/v1/object/public/${bucket}/${val}`;
    },
    [bucket],
  );

  // Whenever the incoming value changes, update preview URL
  useEffect(() => {
    setPreviewUrl(getPublicUrlFromValue(value));
  }, [value, getPublicUrlFromValue]);

  const sanitizeFilename = (name: string) => {
    // Remove extension, sanitize, then re-add extension
    const parts = name.split(".");
    const ext = parts.pop();
    const base = parts.join(".");
    const sanitizedBase = base
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return `${sanitizedBase}-${uuidv4().slice(0, 4)}.${ext}`; // Add 4 random chars to ensure uniqueness while keeping the name
  };

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files?.length) return;

      const file = event.target.files[0];
      if (!file) return;

      // Reset states
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          throw new Error(
            `Invalid file type ${file.type
            }. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
          );
        }

        // Analyze image to determine optimal compression
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        // Calculate optimal quality based on image size and dimensions
        const targetQuality = Math.min(
          MAX_IMAGE_QUALITY,
          Math.max(
            MIN_IMAGE_QUALITY,
            1 - file.size / (1024 * 1024) / MAX_IMAGE_SIZE_MB,
          ),
        );

        // Enhanced compression options
        const options = {
          maxSizeMB: MAX_IMAGE_SIZE_MB,
          maxWidthOrHeight:
            Math.max(img.width, img.height) > TARGET_IMAGE_WIDTH
              ? TARGET_IMAGE_WIDTH
              : undefined,
          useWebWorker: true,
          initialQuality: targetQuality,
          fileType: "image/webp",
          preserveExif: true,
          alwaysKeepResolution: false,
          onProgress: (p: number) => {
            setUploadProgress(p * 0.5); // 0-50% for compression
          },
        };

        const compressedFile = await imageCompression(file, options);
        console.log(
          `SupabaseImageUpload: Compressed file original name: ${file.name
          }, new size: ${(compressedFile.size / 1024 / 1024).toFixed(
            2,
          )} MB, type: ${compressedFile.type}`,
        );

        // TODO: If timeouts persist for uploads, investigate implementing resumable/chunked uploads for more robust large file handling.

        // Retry logic for upload
        let uploadAttemptError: Error | null = null;
        for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
          try {
            setUploadProgress(
              50 + Math.round((attempt / MAX_RETRY_ATTEMPTS) * 40),
            );

            const sanitizedName = sanitizeFilename(file.name);

            // Normalize path: if it starts with the bucket name followed by a slash, remove it to avoid doubling in Storage
            let normalizedPath = path.replace(new RegExp(`^${bucket}/`), "");
            const fullPath = normalizedPath ? `${normalizedPath.replace(/\/$/, "")}/${sanitizedName}` : sanitizedName;

            const { error: uploadError } = await supabase.storage
              .from(bucket)
              .upload(fullPath, compressedFile, {
                contentType: "image/webp",
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) {
              throw uploadError;
            }

            // Return path including bucket name so utilities correctly identify the bucket
            const dbValue = `${bucket}/${fullPath}`;
            setUploadProgress(100);
            onChange(dbValue);
            // Immediately update preview so user sees the image without reload
            setPreviewUrl(getPublicUrlFromValue(dbValue));
            break;
          } catch (error) {
            uploadAttemptError = error as Error;
            const errorMessage =
              error instanceof Error ? error.message : "Upload failed";
            console.error(
              `SupabaseImageUpload: Upload attempt ${attempt + 1} for ${file.name
              } failed:`,
              errorMessage,
            );
            if (attempt < MAX_RETRY_ATTEMPTS - 1) {
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * (attempt + 1)),
              ); // Exponential backoff
            } else {
              setUploadProgress(-1); // Indicate final failure after retries
            }
          }
        }

        if (uploadAttemptError) {
          throw uploadAttemptError;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process image";
        console.error(errorMessage, error);
        setError(errorMessage);
        setUploadProgress(-1);
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, onChange, supabase, getPublicUrlFromValue],
  );

  return (
    <div className="relative">
      <label className="relative cursor-pointer hover:opacity-70 border-dashed border-2 border-neutral-300 flex flex-col justify-center items-center h-[200px] gap-4">
        <input
          type="file"
          onChange={handleUpload}
          accept={ALLOWED_MIME_TYPES.join(",")}
          className="hidden"
          disabled={isUploading}
        />
        {!value && !isUploading && <TbPhotoPlus size={50} />}
        <div className="font-semibold text-lg text-center">
          {isUploading
            ? uploadProgress === -1
              ? "Upload Failed"
              : `Processing... ${uploadProgress}%`
            : value
              ? "Change Image"
              : "Click to upload"}
        </div>
        {error && !isUploading && (
          <div className="text-red-500 text-sm absolute bottom-2 left-2 right-2 text-center bg-white/90 py-1 rounded">
            {error}
          </div>
        )}
        {previewUrl && (
          <div className="absolute inset-0 w-full h-full rounded-[28px] overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Upload"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 text-white font-bold text-sm">
                Change Cover
              </div>
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

export default SupabaseImageUpload;
