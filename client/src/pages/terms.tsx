import React from 'react';

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
            <p className="text-gray-600">Last Updated: October 4, 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Welcome to <strong>JobThrive</strong> (<a href="https://www.jobthrive.in" className="text-blue-600 hover:text-blue-800 underline">www.jobthrive.in</a>). By accessing or using our website and services, you agree to comply with these Terms and Conditions. Please read them carefully.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Services</h2>
            <p className="text-gray-700 mb-6">
              JobThrive provides online job placement, career consulting, and professional guidance services.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. User Accounts</h2>
            <p className="text-gray-700 mb-6">
              You agree to provide accurate information when creating an account or using our services. You are responsible for maintaining the confidentiality of your login credentials.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Payments</h2>
            <p className="text-gray-700 mb-6">
              All payments for services must be made through approved payment gateways. Prices are listed on the website and may be updated without prior notice.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Cancellations and Refunds</h2>
            <p className="text-gray-700 mb-6">
              Refunds are governed by our <a href="/refund" className="text-blue-600 hover:text-blue-800 underline">Refund & Cancellation Policy</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Prohibited Activities</h2>
            <p className="text-gray-700 mb-6">
              You agree not to misuse the website, post false information, or engage in any unlawful activity.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              All content, branding, and materials on JobThrive are owned by us. Unauthorized use is prohibited.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Liability</h2>
            <p className="text-gray-700 mb-6">
              JobThrive is not liable for losses or damages arising from the use of our services, delays, or third-party actions.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These terms are governed by the laws of India, and any disputes will be handled under the jurisdiction of Bengaluru, Karnataka.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Contact</h2>
            <p className="text-gray-700 mb-6">
              For any questions or concerns, please email us at <a href="mailto:admin@jobthrive.in" className="text-blue-600 hover:text-blue-800 underline">admin@jobthrive.in</a>.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>
              <a href="/refund" className="text-blue-600 hover:text-blue-800 underline">Refund Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
