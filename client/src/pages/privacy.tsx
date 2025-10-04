import React from 'react';

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last Updated: September 29, 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              JobThrive.com ("we", "us", "our") values your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our Website and Services.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, billing details and profile information you provide.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, device information, pages visited and other analytics data.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Information</h2>
            <p className="text-gray-700 mb-6">
              We use the information to provide and improve Services, process payments, communicate about services and offers, and to comply with legal obligations.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Sharing & Disclosure</h2>
            <p className="text-gray-700 mb-6">
              We do not sell your personal data. We may share information with trusted third parties such as payment processors (e.g., Razorpay), analytics providers, and service partners strictly to provide the Services. We may also disclose information if required by law.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Cookies & Tracking</h2>
            <p className="text-gray-700 mb-6">
              We use cookies to improve user experience and for analytics. You can manage cookie preferences through your browser settings.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement reasonable security measures to protect your data. However, no transmission method over the Internet is 100% secure.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-6">
              We retain personal information only as long as necessary to provide Services or as required by law.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-6">
              You may request access, correction or deletion of your personal data by contacting us at <a href="mailto:Admin@jobthrive.in" className="text-blue-600 hover:text-blue-800 underline">Admin@jobthrive.in</a>. We will respond within a reasonable timeframe.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. International Transfers</h2>
            <p className="text-gray-700 mb-6">
              We may transfer data to service providers located outside your country. We take steps to ensure an adequate level of protection for such transfers.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Policy from time to time. We will post changes on this page with an updated "Last Updated" date.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Contact</h2>
            <p className="text-gray-700 mb-6">
              For privacy-related questions, contact us at <a href="mailto:Admin@jobthrive.in" className="text-blue-600 hover:text-blue-800 underline">Admin@jobthrive.in</a>.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms & Conditions</a>
              <a href="/refund" className="text-blue-600 hover:text-blue-800 underline">Refund Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
