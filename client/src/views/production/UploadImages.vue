<script setup>
import { ref } from 'vue';
import client from '../../api/client';

const loading = ref(false);
const error = ref('');
const success = ref('');
const files = ref([]);
const provider = ref('local');
const dragOver = ref(false);

const handleDrop = (e) => {
  e.preventDefault();
  dragOver.value = false;
  const droppedFiles = Array.from(e.dataTransfer.files);
  files.value = [...files.value, ...droppedFiles];
};

const handleFileSelect = (e) => {
  const selected = Array.from(e.target.files);
  files.value = [...files.value, ...selected];
};

const removeFile = (i) => {
  files.value.splice(i, 1);
};

const handleUpload = async () => {
  if (files.value.length === 0) { error.value = 'Select at least one image.'; return; }
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    const formData = new FormData();
    files.value.forEach(f => formData.append('images', f));
    formData.append('provider', provider.value);
    await client.post('/production/upload-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    const count = files.value.length;
    success.value = count + ' image(s) uploaded successfully.';
    files.value = [];
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to upload images.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Upload Creative Images</h1>
      <router-link to="/production" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Back</router-link>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{{ error }}</div>
      <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{{ success }}</div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Image Provider</label>
        <select v-model="provider" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="local">Local Storage</option>
          <option value="s3">Amazon S3</option>
          <option value="imgbb">ImgBB</option>
        </select>
      </div>

      <div
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop="handleDrop"
        :class="['border-2 border-dashed rounded-xl p-12 text-center transition-colors', dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400']"
      >
        <div class="text-gray-400 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <p class="text-sm text-gray-600 mb-2">Drag & drop images here, or</p>
        <label class="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
          Browse Files
          <input type="file" multiple accept="image/*" @change="handleFileSelect" class="hidden" />
        </label>
      </div>

      <div v-if="files.length > 0" class="mt-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">{{ files.length }} file(s) selected</h3>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div v-for="(f, i) in files" :key="i" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">{{ f.name }}</span>
            <button @click="removeFile(i)" class="text-red-500 hover:text-red-700 text-sm">Remove</button>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <button @click="handleUpload" :disabled="loading || files.length === 0" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
          {{ loading ? 'Uploading...' : 'Upload Images' }}
        </button>
      </div>
    </div>
  </div>
</template>
