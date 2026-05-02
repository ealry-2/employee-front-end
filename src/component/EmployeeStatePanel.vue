<template>
  <section
    class="employee-state"
    :class="`employee-state--${tone}`"
    :role="tone === 'error' ? 'alert' : undefined"
    :aria-live="tone === 'loading' ? 'polite' : undefined"
  >
    <div class="employee-state__copy">
      <p v-if="eyebrow" class="employee-state__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="title">{{ title }}</h2>
      <p>{{ message }}</p>
    </div>
    <button
      v-if="actionLabel"
      class="employee-secondary-button"
      type="button"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'loading' | 'empty' | 'error' | 'neutral'
    eyebrow?: string
    title?: string
    message: string
    actionLabel?: string
  }>(),
  {
    tone: 'neutral',
    eyebrow: '',
    title: '',
    actionLabel: '',
  },
)

defineEmits<{
  action: []
}>()
</script>
