import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import FileUpload from '@/components/file-upload';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { initializeRazorpay, openPaymentModal, createRazorpayOrder } from '@/lib/razorpay';

interface ReferralRequestPageProps {
  jobId: string;
}

export default function ReferralRequestPage({ jobId }: ReferralRequestPageProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  const verifyPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/payment/verify', data);
      return response.json();
    },
  });

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--purple-primary)]"></div>
      </div>
    );
  }

  const processingFee = job ? parseFloat(job.referralFee) * 0.03 : 0; // 3% processing fee
  const totalAmount = job ? parseFloat(job.referralFee) + processingFee : 0;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

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
      // Initialize Razorpay
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Payment system is not available');
      }

      // Create order
      const { orderId } = await createRazorpayOrder(Math.round(totalAmount * 100));

      // Open Razorpay payment modal
      openPaymentModal({
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: Math.round(totalAmount * 100), // Amount in paise
        currency: 'INR',
        order_id: orderId,
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
            // First, create the referral request
            const referral = await createReferralMutation.mutateAsync({
              jobId: job?.id || 0,
              amount: job?.referralFee || "0",
              resumeUrl: selectedFile ? `resume_${Date.now()}.pdf` : null, // Mock URL
            });

            // Verify payment
            await verifyPaymentMutation.mutateAsync({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              referralId: referral.id,
            });

            setShowCelebration(true);
            toast({
              title: "Payment Successful!",
              description: "Your referral request has been submitted successfully.",
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "There was an error processing your request. Please try again.",
              variant: "destructive",
            });
          }
        },
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Payment failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    setLocation('/dashboard');
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
        <div>
          <h4 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">Upload Your Resume</h4>
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            selectedFile={selectedFile}
          />
        </div>
        
        {/* Payment Section */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-[var(--dark-gray)] mb-4">Payment Details</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Referral Fee</span>
                <span className="font-semibold text-[var(--dark-gray)]">${job?.referralFee || "0"}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-semibold text-[var(--dark-gray)]">${processingFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-lg font-semibold text-[var(--dark-gray)]">Total</span>
                <span className="text-xl font-bold text-[var(--purple-primary)]">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Razorpay Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={!selectedFile || isProcessingPayment}
              className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center space-x-3 hover:bg-blue-700 transition-all duration-300 mt-6"
            >
              <CreditCard className="w-5 h-5" />
              <span>
                {isProcessingPayment ? 'Processing...' : 'Pay with Razorpay'}
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
              <h3 className="text-2xl font-bold text-[var(--dark-gray)] mb-2">Success!</h3>
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
