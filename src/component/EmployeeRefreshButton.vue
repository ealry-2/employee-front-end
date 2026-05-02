<template>
  <button
    class="employee-refresh-button"
    type="button"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
    @click="$emit('click')"
  >
    <svg
      class="employee-refresh-button__icon"
      viewBox="0 0 28 28"
      focusable="false"
      aria-hidden="true"
    >
      <path
        class="employee-refresh-button__stroke"
        d="M22.2 12.4a8.1 8.1 0 0 0-15.1-2.9"
      />
      <path
        class="employee-refresh-button__stroke"
        d="M6.9 5.8v3.7h3.7"
      />
      <path
        class="employee-refresh-button__stroke"
        d="M5.8 15.6a8.1 8.1 0 0 0 15.1 2.9"
      />
      <path
        class="employee-refresh-button__stroke"
        d="M21.1 22.2v-3.7h-3.7"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  disabled?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>
