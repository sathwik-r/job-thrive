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
            <p className="text-gray-600">Last Updated: September 29, 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Welcome to <strong>JobThrive.com</strong> ("Website", "we", "our", or "us"). By accessing or using our website and services you agree to these Terms & Conditions ("Terms"). If you do not agree, please do not use the Website.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Eligibility</h2>
            <p className="text-gray-700 mb-6">
              You must be at least 18 years old to use our services. By using the Website you represent and warrant that you have the right, authority and capacity to enter into these Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Our Services</h2>
            <p className="text-gray-700 mb-6">
              JobThrive provides career services including consultancy, employee referrals, job-matching assistance, and other related services (collectively, "Services"). We may change, suspend or discontinue any Service at any time.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. User Obligations</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide accurate, current and complete information when registering.</li>
              <li>Not to use the Website for any illegal or abusive purpose.</li>
              <li>Not to copy, reproduce or distribute content from the Website without permission.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Payments</h2>
            <p className="text-gray-700 mb-6">
              Payments for Services are processed via third-party payment gateways (for example, Razorpay). By paying for Services you authorize the use of your chosen payment method and agree to the payment processor's terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Refunds</h2>
            <p className="text-gray-700 mb-6">
              Refunds are governed by our <a href="/refund" className="text-blue-600 hover:text-blue-800 underline">Refund Policy</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              To the maximum extent permitted by law, JobThrive will not be liable for any indirect, incidental, special, consequential or exemplary damages arising from your use of the Website. Our total liability for any claim related to a paid Service will not exceed the fees paid by you for that Service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              All content, trademarks and other intellectual property on the Website are owned or licensed by JobThrive. You may not copy or reuse such content without our prior written permission.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These Terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in your registered office city.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Contact</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms, contact us at <a href="mailto:Admin@jobthrive.in" className="text-blue-600 hover:text-blue-800 underline">Admin@jobthrive.in</a>.
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
