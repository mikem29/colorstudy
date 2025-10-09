<svelte:head>
  <title>Terms of Service - HueMixy</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-4">
          <a href="/" class="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <i class="fas fa-palette text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HueMixy
              </h1>
            </div>
          </a>
        </div>

        <div class="flex items-center space-x-4">
          <a
            href="/"
            class="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h2>
      <p class="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div class="prose max-w-none space-y-6 text-gray-700">
        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h3>
          <p>
            By accessing and using HueMixy, you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Description of Service</h3>
          <p>
            HueMixy provides a web-based application for creating color swatches from images. We offer both free and paid subscription tiers with different feature levels.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">User Accounts</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">User Content</h3>
          <p>
            You retain all rights to the content you upload to HueMixy. By uploading content, you grant us the right to store and process your content to provide our services. You are responsible for ensuring you have the necessary rights to any content you upload.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Subscription and Payment</h3>
          <p>
            Paid subscriptions are billed on a recurring basis. You may cancel your subscription at any time. Refunds may be provided at our discretion within 30 days of purchase.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Prohibited Uses</h3>
          <p>
            You agree not to:
          </p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the service</li>
            <li>Upload malicious code or harmful content</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
          <p>
            HueMixy is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Termination</h3>
          <p>
            We may terminate or suspend your account at any time for violations of these terms. Upon termination, your right to use the service will immediately cease.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material changes by updating the date at the top of this page.
          </p>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Contact</h3>
          <p>
            If you have any questions about these Terms of Service, please contact us at <a href="mailto:support@huemixy.com" class="text-blue-600 hover:text-blue-700">support@huemixy.com</a>.
          </p>
        </section>
      </div>
    </div>
  </main>
</div>
