<script>
  import { page } from '$app/stores';
</script>

<div class="h-screen flex bg-gray-100">
  <!-- Left Sidebar -->
  <div class="w-64 bg-gray-900 text-white flex flex-col">
    <div class="p-6 border-b border-gray-700">
      <h1 class="text-2xl font-bold">Admin Panel</h1>
    </div>

    <nav class="flex-1 p-4">
      <a
        href="/admin"
        class="block px-4 py-3 rounded-lg mb-2 transition-colors {$page.url.pathname === '/admin' ? 'bg-blue-600' : 'hover:bg-gray-800'}"
      >
        <i class="fas fa-home mr-3"></i>
        Dashboard
      </a>

      <a
        href="/admin/coupons"
        class="block px-4 py-3 rounded-lg mb-2 transition-colors {$page.url.pathname.startsWith('/admin/coupons') ? 'bg-blue-600' : 'hover:bg-gray-800'}"
      >
        <i class="fas fa-ticket-alt mr-3"></i>
        Coupons
      </a>

      <a
        href="/admin/users"
        class="block px-4 py-3 rounded-lg mb-2 transition-colors {$page.url.pathname.startsWith('/admin/users') ? 'bg-blue-600' : 'hover:bg-gray-800'}"
      >
        <i class="fas fa-users mr-3"></i>
        Users
      </a>
    </nav>

    <div class="p-4 border-t border-gray-700">
      <a href="/dashboard" class="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
        <i class="fas fa-arrow-left mr-3"></i>
        Back to App
      </a>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 overflow-auto">
    <slot />
  </div>
</div>
