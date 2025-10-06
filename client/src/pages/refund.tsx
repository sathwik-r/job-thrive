import React from 'react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <a href="/dashboard" className="text-white font-bold text-sm">JT</a>
            </div>
            <a href="/dashboard" className="font-semibold text-gray-900">JobThrive</a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
            <p className="text-gray-600">Last Updated: October 4, 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              At <strong>JobThrive</strong>, customer satisfaction is important to us. This Refund & Cancellation Policy explains when refunds are applicable.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Service Cancellation</h2>
            <p className="text-gray-700 mb-6">
              You may cancel a purchased service by contacting us at <a href="mailto:Admin@jobthrive.in" className="text-blue-600 hover:text-blue-800 underline">Admin@jobthrive.in</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Refund Eligibility</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Refunds will be processed if services are <strong>not provided within 10 days</strong> of purchase.</li>
              <li>No refunds for services already delivered or partially completed.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Refund Process</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Once approved, refunds will be initiated within <strong>3–4 business days</strong>.</li>
              <li>Refunds are credited to the original payment method (bank/card/UPI).</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Non-Refundable Items</h2>
            <p className="text-gray-700 mb-6">Consultation fees, administrative charges, or services already availed are non-refundable.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Contact Information</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-gray-700 space-y-1">
                <p><strong>Name:</strong> Rehan Yadav</p>
                <p><strong>Phone:</strong> +91 7404035548</p>
                <p><strong>Email:</strong> <a href="mailto:Admin@jobthrive.in" className="text-blue-600 hover:text-blue-800 underline">Admin@jobthrive.in</a></p>
                <p><strong>Address:</strong> B404, Godrej E-City Phase 1, Electronic City Phase 1, Bengaluru – 560100, Karnataka</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms & Conditions</a>
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
