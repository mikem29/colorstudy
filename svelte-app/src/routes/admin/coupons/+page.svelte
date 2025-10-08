<script>
  import { onMount } from 'svelte';

  let coupons = [];
  let loading = true;
  let showModal = false;
  let editingCoupon = null;

  let formData = {
    code: '',
    type: 'upgrade_pro',
    value: null,
    max_uses: 1,
    active: true,
    expires_at: ''
  };

  onMount(() => {
    loadCoupons();
  });

  async function loadCoupons() {
    loading = true;
    try {
      const response = await fetch('/api/admin/coupons');
      const result = await response.json();
      if (result.status === 'success') {
        coupons = result.data;
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      loading = false;
    }
  }

  function openCreateModal() {
    editingCoupon = null;
    formData = {
      code: '',
      type: 'upgrade_pro',
      value: null,
      max_uses: 1,
      active: true,
      expires_at: ''
    };
    showModal = true;
  }

  function openEditModal(coupon) {
    editingCoupon = coupon;
    formData = {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      max_uses: coupon.max_uses,
      active: coupon.active === 1,
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : ''
    };
    showModal = true;
  }

  async function saveCoupon() {
    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';

      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.status === 'success') {
        showModal = false;
        loadCoupons();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Failed to save coupon');
    }
  }

  async function toggleActive(coupon) {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...coupon,
          active: !coupon.active
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        loadCoupons();
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  }

  async function deleteCoupon(id) {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.status === 'success') {
        loadCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  }
</script>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Coupon Management</h1>
      <p class="text-gray-600 mt-2">Create and manage promotional coupons</p>
    </div>
    <button
      onclick={openCreateModal}
      class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
    >
      <i class="fas fa-plus mr-2"></i>
      Create Coupon
    </button>
  </div>

  {#if loading}
    <div class="flex items-center justify-center p-12">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
    </div>
  {:else if coupons.length === 0}
    <div class="bg-white rounded-lg shadow p-12 text-center">
      <i class="fas fa-ticket-alt text-6xl text-gray-300 mb-4"></i>
      <p class="text-xl text-gray-600">No coupons yet</p>
      <button
        onclick={openCreateModal}
        class="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
      >
        Create your first coupon
      </button>
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each coupons as coupon}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-mono font-semibold text-gray-900">{coupon.code}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-600">{coupon.type}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-600">
                  {coupon.value ? `$${coupon.value}` : 'N/A'}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-600">{coupon.used_count} / {coupon.max_uses}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  onclick={() => toggleActive(coupon)}
                  class="px-3 py-1 rounded-full text-xs font-semibold {coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}"
                >
                  {coupon.active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  onclick={() => openEditModal(coupon)}
                  class="text-blue-600 hover:text-blue-800 mr-3"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  onclick={() => deleteCoupon(coupon.id)}
                  class="text-red-600 hover:text-red-800"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
      <div class="p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">
          {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
        </h2>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Code</label>
          <input
            type="text"
            bind:value={formData.code}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., PROMO2024"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            bind:value={formData.type}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="upgrade_pro">Upgrade to Pro</option>
            <option value="discount_percentage">Discount Percentage</option>
            <option value="discount_fixed">Discount Fixed Amount</option>
            <option value="trial_extension">Trial Extension</option>
          </select>
        </div>

        {#if formData.type === 'discount_percentage' || formData.type === 'discount_fixed'}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Value</label>
            <input
              type="number"
              step="0.01"
              bind:value={formData.value}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={formData.type === 'discount_percentage' ? 'e.g., 20' : 'e.g., 10.00'}
            />
          </div>
        {/if}

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Max Uses</label>
          <input
            type="number"
            bind:value={formData.max_uses}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Expires At (Optional)</label>
          <input
            type="datetime-local"
            bind:value={formData.expires_at}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              bind:checked={formData.active}
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div class="p-6 border-t flex justify-end space-x-3">
        <button
          onclick={() => showModal = false}
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onclick={saveCoupon}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {editingCoupon ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  </div>
{/if}
