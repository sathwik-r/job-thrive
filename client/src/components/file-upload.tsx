import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Upload, FileText } from 'lucide-react';
import React from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File | null;
  acceptedTypes?: string;
  maxSizeMessage?: string;
  placeholder?: string;
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  acceptedTypes = ".pdf,.doc,.docx",
  maxSizeMessage = "PDF, DOC, DOCX (Max 5MB)",
  placeholder = "Click to upload or drag and drop"
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="w-5 h-5 text-red-500" />;
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
              isDragOver 
                ? 'border-[#818CF8] bg-[#818CF8]/10' 
                : 'border-[#2A2A2A] hover:border-[#818CF8]'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-12 h-12 text-[#525252] mx-auto mb-4" />
            <p className="text-[#A3A3A3] mb-2">{placeholder}</p>
            <p className="text-sm text-[#525252]">{maxSizeMessage}</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={acceptedTypes}
              onChange={handleFileInputChange}
            />
          </div>
        ) : (
          <div className="bg-[#141414] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile.name)}
              <div>
                <p className="font-medium text-[#F5F5F5]">{selectedFile.name}</p>
                <p className="text-sm text-[#525252]">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
