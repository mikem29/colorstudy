<script>
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Support - HueMixy</title>

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-306485116"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'AW-306485116');
  </script>
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
  <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Support & Contact</h2>

      <div class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Get Help</h3>
          <p class="text-gray-700 mb-4">
            Need help with HueMixy? Have questions, feedback, or suggestions? We'd love to hear from you!
          </p>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-gray-900">
              <i class="fas fa-envelope text-blue-600 mr-2"></i>
              Email us at: <a href="mailto:support@huemixy.com" class="text-blue-600 hover:text-blue-700 font-semibold">support@huemixy.com</a>
            </p>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Partnerships</h3>
          <p class="text-gray-700">
            Interested in partnering with HueMixy? Reach out to us at the same email address for partnership inquiries.
          </p>
        </div>

        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Feedback Welcome</h3>
          <p class="text-gray-700">
            We're constantly improving HueMixy based on user feedback. Whether it's a bug report, feature request, or just a thought - we want to hear it!
          </p>
        </div>
      </div>
    </div>
  </main>

  <Footer />
</div>
