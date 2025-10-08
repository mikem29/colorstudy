<script>
  import { onMount } from 'svelte';

  let stats = {
    totalUsers: 0,
    totalCoupons: 0,
    activeCoupons: 0,
    loading: true
  };

  onMount(async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const result = await response.json();
      if (result.status === 'success') {
        stats = { ...result.data, loading: false };
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      stats.loading = false;
    }
  });
</script>

<div class="p-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
    <p class="text-gray-600 mt-2">Welcome to the admin panel</p>
  </div>

  {#if stats.loading}
    <div class="flex items-center justify-center p-12">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Users -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Users</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <i class="fas fa-users text-2xl text-blue-600"></i>
          </div>
        </div>
      </div>

      <!-- Total Coupons -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Coupons</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalCoupons}</p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <i class="fas fa-ticket-alt text-2xl text-green-600"></i>
          </div>
        </div>
      </div>

      <!-- Active Coupons -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Coupons</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{stats.activeCoupons}</p>
          </div>
          <div class="bg-purple-100 rounded-full p-3">
            <i class="fas fa-check-circle text-2xl text-purple-600"></i>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Quick Actions -->
  <div class="mt-8">
    <h2 class="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a href="/admin/coupons" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <i class="fas fa-plus-circle text-2xl text-blue-600 mb-2"></i>
        <h3 class="text-lg font-semibold text-gray-900">Create Coupon</h3>
        <p class="text-sm text-gray-600 mt-1">Add a new promotional coupon</p>
      </a>

      <a href="/admin/users" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <i class="fas fa-user-check text-2xl text-green-600 mb-2"></i>
        <h3 class="text-lg font-semibold text-gray-900">View Users</h3>
        <p class="text-sm text-gray-600 mt-1">Manage registered users</p>
      </a>
    </div>
  </div>
</div>
