import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreview: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreview }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleRemoveImage = () => {
    onImageUpload(null as unknown as File);
  };

  return (
    <div className="w-full">
      {!imagePreview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag & drop an image here, or click to select one
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: JPEG, PNG, GIF, WebP
          </p>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <FiX className="h-5 w-5" />
          </button>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img
              src={imagePreview}
              alt="Uploaded fashion reference"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Image uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
