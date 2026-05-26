<template>
  <section class="employee-record-list" :aria-labelledby="titleId">
    <div class="employee-record-list__header">
      <component :is="headingTag" :id="titleId" class="employee-record-list__title">
        {{ title }}
      </component>
      <span v-if="countLabel" class="employee-record-list__count">
        {{ countLabel }}
      </span>
    </div>

    <div class="employee-record-list__items">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    titleId: string
    countLabel?: string
    headingLevel?: 2 | 3
  }>(),
  {
    countLabel: '',
    headingLevel: 3,
  },
)

const headingTag = computed(() => `h${props.headingLevel}`)
</script>
