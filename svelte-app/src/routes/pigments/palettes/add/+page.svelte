<script>
  import { goto } from '$app/navigation';

  let formData = {
    name: '',
    type: 'oil',
    description: '',
    is_public: true
  };

  let successMessage = '';
  let errorMessage = '';

  async function handleSubmit() {
    successMessage = '';
    errorMessage = '';

    try {
      const response = await fetch('/api/palettes/color-palettes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.status === 'success') {
        successMessage = 'Palette created successfully!';
        setTimeout(() => {
          goto('/pigments');
        }, 1500);
      } else {
        errorMessage = result.message || 'Failed to create palette';
      }
    } catch (err) {
      errorMessage = 'An error occurred while creating the palette';
      console.error(err);
    }
  }
</script>

<div class="max-w-2xl mx-auto p-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-6 text-center">Create New Palette</h1>

  {#if successMessage}
    <div class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      <i class="fas fa-check-circle mr-2"></i>
      {successMessage}
    </div>
  {/if}

  {#if errorMessage}
    <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <i class="fas fa-exclamation-circle mr-2"></i>
      {errorMessage}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        Palette Name <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="name"
        bind:value={formData.name}
        required
        placeholder="e.g., Gamblin Oils, Winsor Newton Watercolors"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
        Type <span class="text-red-500">*</span>
      </label>
      <select
        id="type"
        bind:value={formData.type}
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="oil">Oil Paint</option>
        <option value="watercolor">Watercolor</option>
        <option value="acrylic">Acrylic</option>
        <option value="digital">Digital</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
        Description
      </label>
      <textarea
        id="description"
        bind:value={formData.description}
        rows="3"
        placeholder="Optional description of this palette..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      ></textarea>
    </div>

    <div class="flex items-center">
      <input
        type="checkbox"
        id="is_public"
        bind:checked={formData.is_public}
        class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
      />
      <label for="is_public" class="ml-2 text-sm text-gray-700">
        Make this palette public (visible to all users)
      </label>
    </div>

    <button
      type="submit"
      class="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
    >
      <i class="fas fa-plus mr-2"></i>
      Create Palette
    </button>
  </form>
</div>
