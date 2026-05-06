<template>
  <article class="employee-work-card" :class="rootClass">
    <button
      v-if="interactive"
      class="employee-work-card__summary"
      type="button"
      :aria-label="ariaLabel"
      @click="$emit('select')"
    >
      <span class="employee-work-card__main">
        <strong>{{ title }}</strong>
        <span v-if="location" class="employee-work-card__location">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {{ location }}
        </span>
        <span v-if="memo" class="employee-work-card__memo">
          {{ memo }}
        </span>
      </span>
      <span class="employee-work-card__times" aria-hidden="true">
        <strong>{{ startTime }}</strong>
        <small>{{ startLabel }}</small>
        <strong>{{ endTime }}</strong>
        <small>{{ endLabel }}</small>
      </span>
      <span v-if="accessibleSummary" class="employee-sr-only">
        {{ accessibleSummary }}
      </span>
    </button>

    <div v-else class="employee-work-card__summary" :aria-label="ariaLabel">
      <span class="employee-work-card__main">
        <strong>{{ title }}</strong>
        <span v-if="location" class="employee-work-card__location">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {{ location }}
        </span>
        <span v-if="memo" class="employee-work-card__memo">
          {{ memo }}
        </span>
      </span>
      <span class="employee-work-card__times" aria-hidden="true">
        <strong>{{ startTime }}</strong>
        <small>{{ startLabel }}</small>
        <strong>{{ endTime }}</strong>
        <small>{{ endLabel }}</small>
      </span>
      <span v-if="accessibleSummary" class="employee-sr-only">
        {{ accessibleSummary }}
      </span>
    </div>

    <div v-if="$slots.footer || statusLabel" class="employee-work-card__footer">
      <slot name="footer"></slot>
      <span
        v-if="statusLabel"
        class="employee-work-status"
        :class="`employee-work-status--${statusTone}`"
      >
        {{ statusLabel }}
      </span>
    </div>

    <slot></slot>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    location?: string
    memo?: string | null
    startTime: string
    startLabel: string
    endTime: string
    endLabel: string
    statusLabel?: string
    statusTone?: 'planned' | 'success' | 'warning' | 'muted'
    ariaLabel?: string
    accessibleSummary?: string
    interactive?: boolean
    compact?: boolean
  }>(),
  {
    location: '',
    memo: null,
    statusLabel: '',
    statusTone: 'planned',
    ariaLabel: '',
    accessibleSummary: '',
    interactive: false,
    compact: false,
  },
)

defineEmits<{
  select: []
}>()

const rootClass = computed(() => ({
  'employee-work-card--interactive': props.interactive,
  'employee-work-card--compact': props.compact,
}))
</script>
