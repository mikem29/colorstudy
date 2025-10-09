<script>
  import { page } from '$app/stores';
</script>

<svelte:head>
  <script src="/js/mixbox.js"></script>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <a href="/pigments" class="text-xl font-bold text-gray-900">
            Pigment Mixer
          </a>
        </div>

        <div class="flex items-center space-x-4">
          <a
            href="/pigments"
            class="text-sm px-3 py-2 rounded-md {$page.url.pathname === '/pigments' ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'}"
          >
            <i class="fas fa-palette mr-1"></i>
            Mixer
          </a>
          <a
            href="/pigments/add"
            class="text-sm px-3 py-2 rounded-md {$page.url.pathname === '/pigments/add' ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'}"
          >
            <i class="fas fa-plus mr-1"></i>
            Add Pigment
          </a>
          <a
            href="/dashboard"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            <i class="fas fa-arrow-left mr-1"></i>
            Back to App
          </a>
        </div>
      </div>
    </div>
  </nav>

  <main>
    <slot />
  </main>
</div>
