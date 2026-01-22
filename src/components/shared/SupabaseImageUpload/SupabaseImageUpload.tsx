"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";
// import { Database } from '@/types/supabase';

export interface SupabaseImageUploadProps {
  bucket: string;
  onComplete: (urls: { webp: string; original: string }) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  path?: string;
}

export const SupabaseImageUpload = ({
  bucket,
  onComplete,
  maxFiles = 1,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
  path = "",
}: SupabaseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const supabase = createClient();

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        if (!event.target.files || event.target.files.length === 0) {
          return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const sanitizeFilename = (name: string) => {
          const parts = name.split(".");
          const ext = parts.pop();
          const base = parts.join(".");
          const sanitizedBase = base
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
          return `${sanitizedBase}-${uuidv4().slice(0, 4)}.${ext}`;
        };

        const files = Array.from(event.target.files).slice(0, maxFiles);

        for (const [index, file] of files.entries()) {
          if (!acceptedFileTypes.includes(file.type)) {
            alert(`Skipping file ${file.name}: Invalid file type ${file.type}`);
            continue;
          }

          // Clean up and validate the file name
          const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
          if (!["jpg", "jpeg", "png", "webp"].includes(fileExt)) {
            alert(`Skipping file ${file.name}: Invalid extension ${fileExt}`);
            continue;
          }

          // --- Image Optimization ---
          let optimizedWebp = file;
          let optimizedJpeg = file;
          let webpFileName = "";
          let jpegFileName = "";
          try {
            // WebP version
            optimizedWebp = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1200,
              useWebWorker: true,
              fileType: "image/webp",
              initialQuality: 0.85,
            });

            const sanitizedName = sanitizeFilename(file.name);
            const baseFolder = path ? `${path.replace(/\/$/, "")}/` : "";

            webpFileName = `${baseFolder}${sanitizedName.split('.').slice(0, -1).join('.')}.webp`;

            // JPEG version
            optimizedJpeg = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1200,
              useWebWorker: true,
              fileType: "image/jpeg",
              initialQuality: 0.85,
            });
            jpegFileName = `${baseFolder}${sanitizedName}`;
          } catch (optErr) {
            alert("Image optimization failed. Uploading original file.");
            const sanitizedName = sanitizeFilename(file.name);
            const baseFolder = path ? `${path.replace(/\/$/, "")}/` : "";

            webpFileName = `${baseFolder}${sanitizedName}.webp`;
            jpegFileName = `${baseFolder}${sanitizedName}`;
          }

          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 10, 90));
          }, 100);

          try {
            // Upload webp
            const { error: uploadWebpError } = await supabase.storage
              .from(bucket)
              .upload(webpFileName, optimizedWebp, {
                cacheControl: "3600",
                upsert: true,
              });
            if (uploadWebpError) throw uploadWebpError;

            // Upload jpeg
            const { error: uploadJpegError } = await supabase.storage
              .from(bucket)
              .upload(jpegFileName, optimizedJpeg, {
                cacheControl: "3600",
                upsert: true,
              });
            if (uploadJpegError) throw uploadJpegError;

            setUploadProgress(100);
            onComplete({ webp: webpFileName, original: jpegFileName });

            if (index < files.length - 1) {
              setUploadProgress(0);
            }
          } catch (error) {
            alert(
              "Error uploading file: " +
              (error instanceof Error
                ? error.message
                : JSON.stringify(error, null, 2)),
            );
            console.error(
              "Error uploading file:",
              error instanceof Error
                ? error.message
                : JSON.stringify(error, null, 2),
            );
          } finally {
            clearInterval(progressInterval);
          }
        }
      } catch (error) {
        alert(
          "Error in handleUpload: " +
          (error instanceof Error
            ? error.message
            : JSON.stringify(error, null, 2)),
        );
        console.error(
          "Error in handleUpload:",
          error instanceof Error
            ? error.message
            : JSON.stringify(error, null, 2),
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [bucket, maxFiles, acceptedFileTypes, onComplete, supabase],
  );

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleUpload}
        accept={acceptedFileTypes.join(",")}
        multiple={maxFiles > 1}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary hover:file:text-white"
      />
      {isUploading && (
        <div className="mt-2">
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-primary rounded transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
};
