<script setup lang="ts">
import { MESSAGES } from '@shared/messages'
</script>

<template>
  <span class="inline-flex items-center gap-1" :aria-label="MESSAGES.loading.aiThinking">
    <span
      v-for="dot in 3"
      :key="dot"
      class="h-2 w-2 animate-bounce rounded-full bg-blue-500"
      :style="{ animationDelay: `${(dot - 1) * 120}ms` }"
    />
  </span>
</template>
