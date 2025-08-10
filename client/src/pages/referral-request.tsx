import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, CreditCard, Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { initializeRazorpay, openPaymentModal, createRazorpayOrder, verifyPayment } from '@/lib/razorpay';

interface ReferralRequestPageProps {
  jobId: string;
}

export default function ReferralRequestPage({ jobId }: ReferralRequestPageProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { data: job, isLoading } = useQuery<any>({
    queryKey: ['/api/jobs', jobId],
    enabled: !!jobId,
  });

  const createReferralMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/referrals', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/seeker', user?.id] });
    },
  });

  // File upload handlers
  const handleFileSelect = (file: File) => {
    if (!isValidFile(file)) {
      return;
    }
    setSelectedFile(file);
    toast({
      title: "Resume Selected",
      description: `${file.name} has been selected for upload.`,
    });
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    toast({
      title: "Resume Removed",
      description: "Resume has been removed from your submission.",
    });
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const uploadResume = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('userId', user?.id?.toString() || '');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setIsUploading(false);
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully.",
      });

      return result.fileUrl;
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--purple-primary)]"></div>
      </div>
    );
  }

  const totalAmount = job ? parseFloat(job.referralFee) : 0;

  const handlePayment = async () => {
    if (!selectedFile) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume before proceeding with payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Upload resume first
      //const resumeUrl = await uploadResume();

      // Initialize Razorpay
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Payment system is not available');
      }

      // Create the referral request with resume
      const referral = await createReferralMutation.mutateAsync({
        jobId: job?.id || 0,
        amount: job?.referralFee || "0",
       // resumeUrl: resumeUrl,
      });

      // Create order with backend
      const orderData = await createRazorpayOrder(totalAmount, job?.id || 0);

      // Open Razorpay payment modal
      openPaymentModal({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'Circl Referral',
        description: `Job Referral Fee for ${job?.title} at ${job?.company}`,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#6366F1',
        },
        handler: async (response) => {
          try {
            // Verify payment with backend
            await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id!,
              response.razorpay_signature!,
              referral.id
            );

            setShowCelebration(true);
            toast({
              title: "Payment Successful!",
              description: "Your referral request has been submitted successfully.",
            });
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: error instanceof Error ? error.message : "Please contact support.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Payment failed. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    setLocation('/dashboard');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 pb-20">
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/job-search')}
            className="flex items-center space-x-2 text-gray-600 hover:text-[var(--purple-primary)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Button>
          
          <h2 className="text-2xl font-bold text-[var(--dark-gray)]">Apply for Referral</h2>
        </div>
        
        {/* Selected Job Info */}
        <Card className="bg-gradient-to-r from-[var(--purple-primary)] to-[var(--purple-light)] text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">{job?.title}</h3>
            <p className="text-lg opacity-90 mb-1">{job?.company}</p>
            <p className="opacity-75 mb-4">{job?.location}</p>
            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span>Referral Fee</span>
                <span className="text-2xl font-bold">${job?.referralFee}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Resume Upload */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">Upload Your Resume</h4>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-[var(--purple-primary)] bg-purple-50' 
                    : 'border-gray-300 hover:border-[var(--purple-primary)]'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h5 className="text-lg font-semibold text-[var(--dark-gray)] mb-2">
                  Drop your resume here
                </h5>
                <p className="text-gray-600 mb-4">
                  or click to browse files
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="resume-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className="border-[var(--purple-primary)] text-[var(--purple-primary)] hover:bg-[var(--purple-primary)] hover:text-white"
                >
                  Choose File
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-[var(--purple-primary)]" />
                    <div>
                      <p className="font-semibold text-[var(--dark-gray)]">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileRemove}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[var(--purple-primary)] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                    className="flex-1"
                  >
                    Replace File
                  </Button>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="resume-upload"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Payment Section */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">Payment Details</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Referral Fee</span>
                <span className="font-semibold text-[var(--dark-gray)]">${job?.referralFee || "0"}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-lg font-semibold text-[var(--dark-gray)]">Total</span>
                <span className="text-xl font-bold text-[var(--purple-primary)]">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Razorpay Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessingPayment || !selectedFile || isUploading}
              className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center space-x-3 hover:bg-blue-700 transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5" />
              <span>
                {isProcessingPayment ? 'Processing...' : 
                 !selectedFile ? 'Upload Resume First' :
                 isUploading ? 'Uploading Resume...' :
                 'Pay with Razorpay'}
              </span>
            </Button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              Secure payment powered by Razorpay. Your payment is protected.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-6 p-6">
            <div className="animate-bounce">
              <div className="w-20 h-20 mx-auto bg-[var(--emerald-success)] rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-[var(--dark-gray)] mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your referral request has been submitted successfully</p>
            </div>
            
            <Button
              onClick={handleCelebrationClose}
              className="w-full bg-[var(--purple-primary)] text-white font-semibold py-4 px-6 rounded-2xl hover:bg-[var(--purple-primary)]/90 transition-colors"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
