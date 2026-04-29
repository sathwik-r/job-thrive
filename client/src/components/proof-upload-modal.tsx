import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import React from 'react';

interface ProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
}

export default function ProofUploadModal({ isOpen, onClose, onSubmit }: ProofUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#F5F5F5]">Upload Proof</DialogTitle>
          <p className="text-[#A3A3A3] text-sm">Upload a screenshot showing you submitted the referral</p>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-[#2A2A2A] rounded-2xl p-8 text-center cursor-pointer hover:border-[#818CF8] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-12 h-12 text-[#525252] mx-auto mb-4" />
              <p className="text-[#A3A3A3] mb-2">Take Photo or Upload</p>
              <p className="text-sm text-[#525252]">PNG, JPG (Max 10MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileInputChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {preview && (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Proof preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="bg-[#141414] rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-[#818CF8]" />
                  <div>
                    <p className="font-medium text-[#F5F5F5]">{selectedFile.name}</p>
                    <p className="text-sm text-[#525252]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile}
              className="flex-1 bg-[#818CF8] hover:bg-[#818CF8]/90"
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
