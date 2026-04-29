import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B0A10]">
      {/* Header */}
      <header className="bg-[#1A1828]  border-b border-[#252336] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#6D5BF7] to-[#1DB954] rounded-lg flex items-center justify-center">
              <a href="/dashboard" className="text-white font-bold text-sm text-[#FAFAFA]">JT</a>
            </div>
              <a href="/dashboard" className="font-semibold text-[#FAFAFA]">JobThrive</a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-[#1A1828] rounded-lg  p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">Privacy Policy</h1>
            <p className="text-[#5C5A72]">Last Updated: October 4, 2025</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-[#A1A0B3] mb-6">
              At <strong>JobThrive</strong>, we value your privacy and are committed to protecting your personal data.
            </p>

            <h2 className="text-xl font-semibold text-[#FAFAFA] mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-[#A1A0B3] mb-2">We collect information such as your name, email, phone number, and professional details when you use our services or register on our site.</p>

            <h2 className="text-xl font-semibold text-[#FAFAFA] mt-8 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-[#A1A0B3] mb-6 space-y-2">
              <li>To provide and improve our services</li>
              <li>To communicate with you regarding updates, offers, or support</li>
              <li>To comply with legal requirements</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#FAFAFA] mt-8 mb-4">3. Data Sharing</h2>
            <p className="text-[#A1A0B3] mb-6">We do not sell your data. Your information may be shared only with trusted partners necessary for providing our services.</p>

            <h2 className="text-xl font-semibold text-[#FAFAFA] mt-8 mb-4">4. Cookies</h2>
            <p className="text-[#A1A0B3] mb-6">We use cookies to enhance your browsing experience and analyze site performance.</p>

            <h2 className="text-xl font-semibold text-[#FAFAFA] mt-8 mb-4">5. Data Security</h2>
            <p className="text-[#A1A0B3] mb-6">We employ reasonable measures to safeguard your data from unauthorized access or misuse.</p>

            <h2 className="text-xl font-semibold text-[#FAFAFA] mt-8 mb-4">6. Your Rights</h2>
            <p className="text-[#A1A0B3] mb-6">You can request access, correction, or deletion of your personal data by contacting us.</p>

            <h2 className="text-xl font-semibold text-[#FAFAFA] mt-8 mb-4">7. Contact</h2>
            <p className="text-[#A1A0B3] mb-6">For any privacy-related concerns, please email us at <a href="mailto:Admin@jobthrive.in" className="text-[#6D5BF7] hover:text-[#A259FF] underline">Admin@jobthrive.in</a>.</p>
          </div>

          <div className="mt-12 pt-8 border-t border-[#252336]">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/terms" className="text-[#6D5BF7] hover:text-[#A259FF] underline">Terms & Conditions</a>
              <a href="/refund" className="text-[#6D5BF7] hover:text-[#A259FF] underline">Refund Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
