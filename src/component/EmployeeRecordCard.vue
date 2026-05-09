<template>
  <button
    class="employee-record-card"
    :class="rootClass"
    type="button"
    @click="$emit('select')"
  >
    <span class="employee-record-card__icon" :class="iconClass" aria-hidden="true">
      <slot name="icon"></slot>
    </span>
    <span class="employee-record-card__main">
      <slot></slot>
    </span>
    <span v-if="$slots.side" class="employee-record-card__side">
      <slot name="side"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    selected?: boolean
    selectedTone?: 'primary' | 'lavender'
    iconClass?: string
  }>(),
  {
    selected: false,
    selectedTone: 'primary',
    iconClass: '',
  },
)

defineEmits<{
  select: []
}>()

const rootClass = computed(() => ({
  'is-selected': props.selected,
  'employee-record-card--selected-lavender': props.selectedTone === 'lavender',
}))
</script>
