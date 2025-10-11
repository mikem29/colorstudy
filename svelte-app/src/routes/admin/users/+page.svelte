<script>
  import { onMount } from 'svelte';

  let users = [];
  let artboards = [];
  let sessions = [];
  let loading = true;
  let loadingArtboards = true;
  let loadingSessions = true;
  let searchQuery = '';
  let showModal = false;
  let editingUser = null;
  let activeUsersCount = 0;
  let totalSessions = 0;
  let calculatingArtboardId = null;

  let formData = {
    email: '',
    password: '',
    subscription_tier: 'free'
  };

  onMount(() => {
    loadUsers();
    loadArtboards();
    loadSessions();
  });

  async function loadUsers() {
    loading = true;
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      if (result.status === 'success') {
        users = result.data;
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      loading = false;
    }
  }

  async function loadArtboards() {
    loadingArtboards = true;
    try {
      const response = await fetch('/api/admin/artboards');
      const result = await response.json();
      if (result.status === 'success') {
        artboards = result.data;
      }
    } catch (error) {
      console.error('Error loading artboards:', error);
    } finally {
      loadingArtboards = false;
    }
  }

  async function loadSessions() {
    loadingSessions = true;
    try {
      const response = await fetch('/api/admin/sessions');
      const result = await response.json();
      if (result.status === 'success') {
        sessions = result.data.sessions;
        activeUsersCount = result.data.active_users;
        totalSessions = result.data.total_sessions;
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      loadingSessions = false;
    }
  }

  function formatTimeRemaining(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(seconds / 60)}m`;
  }

  function openEditModal(user) {
    editingUser = user;
    formData = {
      email: user.email,
      password: '',
      subscription_tier: user.subscription_tier || 'free'
    };
    showModal = true;
  }

  async function saveUser() {
    try {
      const payload = {
        email: formData.email,
        subscription_tier: formData.subscription_tier
      };

      // Only include password if it's been entered
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === 'success') {
        showModal = false;
        loadUsers();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user');
    }
  }

  async function deleteUser(user) {
    if (!confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.status === 'success') {
        loadUsers();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  }

  async function calculateAllMixes(artboardId) {
    if (!confirm('This will calculate paint mix formulas for all swatches. Continue?')) {
      return;
    }

    calculatingArtboardId = artboardId;
    try {
      const response = await fetch(`/api/artboards/${artboardId}/calculate-mixes`, {
        method: 'POST'
      });
      const result = await response.json();

      if (result.status === 'started') {
        alert(`Mix calculation started! Processing ${result.total_swatches} swatches in background.`);
      } else {
        alert('Failed to start calculation: ' + result.message);
      }
    } catch (error) {
      console.error('Error calculating mixes:', error);
      alert('Failed to start calculation');
    } finally {
      calculatingArtboardId = null;
    }
  }

  $: filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.id?.toLowerCase().includes(query)
    );
  });

  $: activeUserIds = new Set(sessions.map(s => s.user_id));

  function isUserOnline(userId) {
    return activeUserIds.has(userId);
  }
</script>

<div class="p-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
    <p class="text-gray-600 mt-2">View and manage registered users</p>
  </div>

  <div class="mb-6">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search by email or ID..."
      class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {#if loading}
    <div class="flex items-center justify-center p-12">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
    </div>
  {:else if filteredUsers.length === 0}
    <div class="bg-white rounded-lg shadow p-12 text-center">
      <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
      <p class="text-xl text-gray-600">
        {searchQuery ? 'No users found matching your search' : 'No users yet'}
      </p>
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each filteredUsers as user}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center relative">
                    <i class="fas fa-user text-blue-600"></i>
                    {#if isUserOnline(user.id)}
                      <span class="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" title="Online"></span>
                    {/if}
                  </div>
                  <div class="ml-4">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm font-medium text-gray-900">{user.email}</span>
                      {#if isUserOnline(user.id)}
                        <span class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Online</span>
                      {/if}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {user.subscription_tier === 'paid' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                  {user.subscription_tier === 'paid' ? 'pro' : 'free'}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-xs font-mono text-gray-500">{user.id}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  onclick={() => openEditModal(user)}
                  class="text-blue-600 hover:text-blue-800 mr-3"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  onclick={() => deleteUser(user)}
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

    <div class="mt-4 text-sm text-gray-600">
      Showing {filteredUsers.length} of {users.length} users
    </div>
  {/if}

  <!-- Active Sessions Section -->
  <div class="mt-12">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Active Sessions</h2>
        <p class="text-gray-600 mt-2">Currently logged in users</p>
      </div>
      {#if !loadingSessions}
        <div class="flex items-center space-x-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{activeUsersCount}</div>
            <div class="text-sm text-gray-600">Active Users</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{totalSessions}</div>
            <div class="text-sm text-gray-600">Total Sessions</div>
          </div>
        </div>
      {/if}
    </div>

    {#if loadingSessions}
      <div class="flex items-center justify-center p-12">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
      </div>
    {:else if sessions.length === 0}
      <div class="bg-white rounded-lg shadow p-12 text-center">
        <i class="fas fa-user-slash text-6xl text-gray-300 mb-4"></i>
        <p class="text-xl text-gray-600">No active sessions</p>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Remaining</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each sessions as session}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-green-600"></i>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{session.email}</div>
                      <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {session.subscription_tier === 'paid' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                        {session.subscription_tier === 'paid' ? 'pro' : 'free'}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-mono text-gray-500">{session.session_id.substring(0, 16)}...</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(session.expires_at_date).toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">
                    {formatTimeRemaining(session.time_until_expiry)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    <i class="fas fa-circle text-green-500 mr-1 text-xs"></i>
                    Active
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="mt-4 text-sm text-gray-600">
        Showing {sessions.length} active sessions from {activeUsersCount} users
      </div>
    {/if}
  </div>

  <!-- All Artboards Section -->
  <div class="mt-12">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">All Artboards</h2>
      <p class="text-gray-600 mt-2">View all user artboards for support and monitoring</p>
    </div>

    {#if loadingArtboards}
      <div class="flex items-center justify-center p-12">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
      </div>
    {:else if artboards.length === 0}
      <div class="bg-white rounded-lg shadow p-12 text-center">
        <i class="fas fa-palette text-6xl text-gray-300 mb-4"></i>
        <p class="text-xl text-gray-600">No artboards created yet</p>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artboard</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each artboards as artboard}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-palette text-purple-600"></i>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{artboard.name}</div>
                      <div class="text-xs text-gray-500">ID: {artboard.id}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{artboard.user_email}</div>
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {artboard.subscription_tier === 'paid' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                    {artboard.subscription_tier === 'paid' ? 'pro' : 'free'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {artboard.width_inches}" × {artboard.height_inches}"
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    <i class="fas fa-image text-gray-400 mr-1"></i> {artboard.image_count}
                    <i class="fas fa-palette text-gray-400 ml-3 mr-1"></i> {artboard.swatch_count}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(artboard.updated_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <button
                    onclick={() => calculateAllMixes(artboard.id)}
                    disabled={calculatingArtboardId === artboard.id}
                    class="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Calculate paint mix formulas for all swatches"
                  >
                    {#if calculatingArtboardId === artboard.id}
                      <i class="fas fa-spinner fa-spin mr-2"></i>
                    {:else}
                      <i class="fas fa-flask mr-2"></i>
                    {/if}
                    Calculate Mixes
                  </button>
                  <a
                    href="/artboard/{artboard.id}"
                    target="_blank"
                    class="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <i class="fas fa-external-link-alt mr-2"></i>
                    View
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="mt-4 text-sm text-gray-600">
        Showing {artboards.length} artboards
      </div>
    {/if}
  </div>
</div>

<!-- Edit User Modal -->
{#if showModal && editingUser}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
      <div class="p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">Edit User</h2>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            bind:value={formData.email}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password (leave blank to keep current)</label>
          <input
            type="text"
            bind:value={formData.password}
            placeholder="Enter new password or leave blank"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Subscription Tier</label>
          <select
            bind:value={formData.subscription_tier}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="free">Free</option>
            <option value="paid">Pro</option>
          </select>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-xs text-gray-600">
            <strong>User ID:</strong> <span class="font-mono">{editingUser.id}</span>
          </p>
          <p class="text-xs text-gray-600 mt-1">
            <strong>Registered:</strong> {new Date(editingUser.created_at).toLocaleString()}
          </p>
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
          onclick={saveUser}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
{/if}
