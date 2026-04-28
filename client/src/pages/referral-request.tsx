import { useState } from 'react';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, CreditCard, Upload, FileText, X, RefreshCw, CheckCircle2, Shield, Sparkles, MapPin, Building2, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { initializeCashfree, openCashfreeCheckout, createCashfreeOrder, verifyCashfreePayment } from '@/lib/cashfree';
import { motion, AnimatePresence } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

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
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [phone, setPhone] = useState('');

  const { data: job, isLoading, isError } = useQuery<any>({
    queryKey: ['/api/jobs', jobId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/jobs/${jobId}`);
      return res.json();
    },
    enabled: !!jobId,
    retry: false,
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
  const handleFileSelect = async (file: File) => {
    if (!isValidFile(file)) {
      return;
    }

    setSelectedFile(file);
    setUploadedResumeUrl(null); // Reset previous upload

    toast({
      title: "Resume Selected",
      description: `${file.name} has been selected. Uploading to S3...`,
    });

    // Immediately upload to S3
    try {
      const resumeUrl = await uploadResumeToS3(file);
      setUploadedResumeUrl(resumeUrl);
      toast({
        title: "Resume Uploaded Successfully",
        description: "Your resume is now ready for submission.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
      setSelectedFile(null);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadedResumeUrl(null);
    setUploadProgress(0);
    toast({
      title: "Resume Removed",
      description: "Resume has been removed from your submission.",
    });
  };

  const handleReplaceFile = () => {
    // Reset everything when replacing file
    setSelectedFile(null);
    setUploadedResumeUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
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

  const uploadResumeToS3 = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get pre-signed URL from server
      const presignedUrlResponse = await apiRequest('POST', '/api/upload/resume-presigned-url', {
        fileName: file.name,
        fileType: file.type,
      });

      if (!presignedUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { presignedUrl, s3Key } = await presignedUrlResponse.json();

      // Step 2: Upload file directly to S3 using pre-signed URL with progress tracking
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            // Construct the final S3 URL
            const s3Url = `https://job-thrive.s3.amazonaws.com/${s3Key}`;

            setUploadProgress(100);
            setIsUploading(false);
            resolve(s3Url);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--purple-primary)]"></div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-[var(--dark-gray)]">Job not found</p>
          <Button variant="outline" onClick={() => setLocation('/job-search')}>Back to Jobs</Button>
        </div>
      </div>
    );
  }

  const totalAmount = job ? parseFloat(job.referralFee) : 0;

  const handlePayment = async () => {
    if (!uploadedResumeUrl) {
      toast({
        title: "Resume Required",
        description: "Please wait for resume upload to complete before proceeding with payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Initialize Cashfree
      const cashfreeLoaded = await initializeCashfree();
      if (!cashfreeLoaded) {
        throw new Error('Payment system is not available');
      }

      // Create the referral request with resume URL (already uploaded)
      const referral = await createReferralMutation.mutateAsync({
        jobId: job?.id || 0,
        amount: job?.referralFee || "0",
        resumeUrl: uploadedResumeUrl,
      });

      // Create order with backend (Cashfree)
      const orderData = await createCashfreeOrder(totalAmount, job?.id || 0, 'INR', phone || undefined);

      // Open Cashfree checkout (popup)
      const result = await openCashfreeCheckout(orderData.paymentSessionId, orderData.mode, '_modal');

      // For popup, promise resolves after payment attempt; verify on server if success
      if (result && result.paymentDetails) {
        try {
          await verifyCashfreePayment(orderData.orderId, referral.id);
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
      } else {
        // If result not available, rely on manual verification via return URL flow or user retry
        setIsProcessingPayment(false);
      }
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
    <div className="min-h-screen bg-gray-50/80">
      <div className="p-6 space-y-8 pb-24 max-w-lg mx-auto">
        {/* Back + Title */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-3"
        >
          <Button
            variant="ghost"
            onClick={() => setLocation('/job-search')}
            className="flex items-center space-x-2 text-gray-400 hover:text-[var(--purple-primary)] transition-colors -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Button>

          <h2 className="text-2xl font-bold text-[var(--dark-gray)] tracking-tight">Apply for Referral</h2>
        </motion.div>

        {/* Selected Job Info - Gradient Card */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="border-0 overflow-hidden shadow-xl shadow-[var(--purple-primary)]/10">
            <div className="relative bg-gradient-to-br from-[var(--purple-primary)] via-[var(--purple-light)] to-[var(--emerald-success)] p-[1px] rounded-xl">
              <CardContent className="relative p-6 bg-gradient-to-br from-[var(--purple-primary)] to-[var(--purple-light)] rounded-[11px] text-white overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1.5 tracking-tight">{job?.title}</h3>
                  <div className="flex items-center space-x-2 text-white/80 mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{job?.company}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/60 mb-5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-sm">{job?.location}</span>
                  </div>

                  <div className="pt-4 border-t border-white/15">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm font-medium">Referral Fee</span>
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="w-5 h-5 text-white/90" />
                        <span className="text-2xl font-bold">{job?.referralFee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Resume Upload */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="modern-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[var(--purple-primary)]/8 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[var(--purple-primary)]" />
                </div>
                <h4 className="text-sm font-semibold text-[var(--dark-gray)]">Upload Your Resume</h4>
              </div>

              {!selectedFile ? (
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer group ${
                    isDragOver
                      ? 'border-[var(--purple-primary)] bg-[var(--purple-primary)]/5 scale-[1.01]'
                      : 'border-gray-200 hover:border-[var(--purple-primary)]/40 hover:bg-gray-50/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isDragOver
                      ? 'bg-[var(--purple-primary)]/12 scale-110'
                      : 'bg-gray-100 group-hover:bg-[var(--purple-primary)]/8'
                  }`}>
                    <Upload className={`w-7 h-7 transition-colors duration-300 ${
                      isDragOver ? 'text-[var(--purple-primary)]' : 'text-gray-400 group-hover:text-[var(--purple-primary)]'
                    }`} />
                  </div>

                  <h5 className="text-base font-semibold text-[var(--dark-gray)] mb-1.5">
                    {isDragOver ? 'Drop it here' : 'Drop your resume here'}
                  </h5>
                  <p className="text-sm text-gray-400 mb-5">
                    or click to browse files
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="resume-upload"
                  />

                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-300">
                    <span className="pill-badge bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full">PDF</span>
                    <span className="pill-badge bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full">DOC</span>
                    <span className="pill-badge bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full">DOCX</span>
                    <span className="text-gray-300">Max 5MB</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[var(--purple-primary)]/8 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[var(--purple-primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[var(--dark-gray)] truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFileRemove}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0 ml-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2.5 px-1"
                    >
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-medium">Uploading...</span>
                        <span className="text-[var(--purple-primary)] font-semibold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Upload Success */}
                  {uploadedResumeUrl && !isUploading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center space-x-3 p-3.5 bg-[var(--emerald-success)]/5 border border-[var(--emerald-success)]/15 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--emerald-success)]/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4.5 h-4.5 text-[var(--emerald-success)]" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-[var(--emerald-success)]">Upload complete</span>
                        <p className="text-xs text-[var(--emerald-success)]/70 mt-0.5">Your resume is ready for submission</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleReplaceFile}
                      className="flex-1 h-11 rounded-xl border-gray-200 text-gray-500 hover:text-[var(--purple-primary)] hover:border-[var(--purple-primary)]/30 transition-colors"
                      disabled={isUploading}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-2" />
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
        </motion.div>

        {/* Payment Section */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="modern-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[var(--emerald-success)]/8 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[var(--emerald-success)]" />
                </div>
                <h4 className="text-sm font-semibold text-[var(--dark-gray)]">Payment Details</h4>
              </div>

              <div className="space-y-5">
                {/* Phone Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your 10-digit phone"
                    className="w-full h-12 border border-gray-200 rounded-xl px-4 outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/20 focus:border-[var(--purple-primary)] text-base placeholder:text-gray-300 transition-all"
                  />
                </div>

                {/* Fee Breakdown */}
                <div className="bg-gray-50/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Referral Fee</span>
                    <span className="text-sm font-semibold text-[var(--dark-gray)]">{job?.referralFee || "0"}</span>
                  </div>
                  <div className="border-t border-gray-200/60" />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-[var(--dark-gray)]">Total</span>
                    <span className="text-xl font-bold gradient-text">{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessingPayment || !uploadedResumeUrl || isUploading || phone.trim().length < 10}
                className="w-full h-14 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--purple-light)] text-white font-semibold text-base rounded-2xl flex items-center justify-center space-x-2.5 mt-6 shadow-lg shadow-[var(--purple-primary)]/20 hover:shadow-xl hover:shadow-[var(--purple-primary)]/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : !uploadedResumeUrl ? (
                  <>
                    <Upload className="w-4.5 h-4.5" />
                    <span>Upload Resume First</span>
                  </>
                ) : isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading Resume...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4.5 h-4.5" />
                    <span>Pay Securely</span>
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center space-x-1.5 mt-4">
                <Shield className="w-3 h-3 text-gray-300" />
                <p className="text-xs text-gray-400">
                  Secure payment powered by Cashfree
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By proceeding with payment, you agree to our{' '}
                  <a href="/terms" className="text-[var(--purple-primary)] hover:underline">
                    Terms & Conditions
                  </a>
                  ,{' '}
                  <a href="/privacy" className="text-[var(--purple-primary)] hover:underline">
                    Privacy Policy
                  </a>
                  , and{' '}
                  <a href="/refund" className="text-[var(--purple-primary)] hover:underline">
                    Refund Policy
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Success Modal with confetti-style feel */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl">
          <div className="text-center space-y-6 p-8 relative overflow-hidden">
            {/* Decorative confetti-like elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-[var(--purple-primary)]/20 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-[var(--emerald-success)]/20 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute top-12 left-16 w-1.5 h-1.5 rounded-full bg-amber-400/30 animate-bounce" style={{ animationDelay: '0.4s' }} />
              <div className="absolute top-6 right-20 w-2.5 h-2.5 rounded-full bg-pink-400/20 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="absolute bottom-20 left-8 w-2 h-2 rounded-full bg-blue-400/20 animate-bounce" style={{ animationDelay: '0.3s' }} />
              <div className="absolute bottom-16 right-10 w-1.5 h-1.5 rounded-full bg-[var(--purple-primary)]/15 animate-bounce" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-20 left-1/2 w-2 h-2 rounded-full bg-[var(--emerald-success)]/15 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="absolute bottom-28 left-1/3 w-3 h-3 rounded-full bg-amber-300/15 animate-bounce" style={{ animationDelay: '0.35s' }} />
            </div>

            <div className="relative z-10">
              {/* Success Icon */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-[var(--emerald-success)]/10 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[var(--emerald-success)] to-emerald-400 flex items-center justify-center shadow-lg shadow-[var(--emerald-success)]/25">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Success</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>

              <h3 className="text-2xl font-bold text-[var(--dark-gray)] mb-2 tracking-tight">Payment Successful!</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Your referral request has been submitted successfully. You'll hear back soon.
              </p>
            </div>

            <Button
              onClick={handleCelebrationClose}
              className="relative z-10 w-full h-13 bg-gradient-to-r from-[var(--purple-primary)] to-[var(--emerald-success)] text-white font-semibold rounded-2xl shadow-lg shadow-[var(--purple-primary)]/20 hover:shadow-xl hover:shadow-[var(--purple-primary)]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Continue to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
