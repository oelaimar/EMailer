import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToastStore } from '../stores/toast';

export function useCrudForm({ createFn, updateFn, redirectPath, successMessage }) {
  const router = useRouter();
  const route = useRoute();
  const toastStore = useToastStore();

  const isEdit = computed(() => !!route.params.id);
  const id = computed(() => route.params.id);
  const saving = ref(false);
  const loading = ref(false);
  const error = ref('');
  const form = ref({});

  async function handleSubmit() {
    error.value = '';
    saving.value = true;
    try {
      if (isEdit.value) {
        await updateFn(id.value, form.value);
      } else {
        await createFn(form.value);
      }
      toastStore.showToast(successMessage || (isEdit.value ? 'Updated successfully.' : 'Created successfully.'), 'success');
      router.push(redirectPath);
    } catch (e) {
      error.value = e.response?.data?.error || 'Failed to save.';
      toastStore.showToast(error.value, 'error');
    } finally {
      saving.value = false;
    }
  }

  return { isEdit, id, saving, loading, error, form, handleSubmit };
}
