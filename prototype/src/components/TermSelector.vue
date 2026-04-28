<script setup lang="ts">
import { computed, ref } from 'vue'
import LoadingDots from './LoadingDots.vue'
import { MESSAGES } from '@shared/messages'
import type { Term } from '@shared/types'

type CategoryFilter = (typeof MESSAGES.termSelector.categories)[number]

const props = defineProps<{
  terms: Term[]
  isLoading: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  select: [term: Term]
  'retry-load': []
}>()

const categories = MESSAGES.termSelector.categories
const selectedCategory = ref<CategoryFilter>(MESSAGES.termSelector.allCategory)

const filteredTerms = computed(() => {
  if (selectedCategory.value === MESSAGES.termSelector.allCategory) {
    return props.terms
  }

  return props.terms.filter((term) => term.category === selectedCategory.value)
})

function selectRandomTerm() {
  if (props.isLoading || filteredTerms.value.length === 0) {
    return
  }

  const index = Math.floor(Math.random() * filteredTerms.value.length)
  emit('select', filteredTerms.value[index])
}
</script>

<template>
  <section class="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8 lg:py-12">
    <div class="mb-8">
      <p class="mb-2 text-sm font-semibold text-blue-700">{{ MESSAGES.termSelector.eyebrow }}</p>
      <h1 class="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{{ MESSAGES.termSelector.appName }}</h1>
      <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
        {{ MESSAGES.termSelector.description }}
      </p>
    </div>

    <div class="mb-6 flex flex-col gap-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="rounded-full border px-4 py-2 text-sm font-semibold transition"
          :class="
            selectedCategory === category
              ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
          "
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <button
        type="button"
        class="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-300"
        :disabled="isLoading || filteredTerms.length === 0"
        @click="selectRandomTerm"
      >
        {{ MESSAGES.termSelector.randomButton }}
      </button>
    </div>

    <div v-if="isLoading" class="rounded-lg border border-blue-100 bg-white p-6 text-center shadow-sm">
      <div class="flex items-center justify-center gap-3 text-blue-700">
        <LoadingDots />
        <span class="text-sm font-bold">{{ MESSAGES.termSelector.loadingTerms }}</span>
      </div>
    </div>

    <div v-else-if="errorMessage" class="rounded-lg border border-orange-100 bg-orange-50 p-6 shadow-sm">
      <p class="text-sm font-semibold leading-6 text-orange-900">{{ errorMessage }}</p>
      <button
        type="button"
        class="mt-4 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200"
        @click="emit('retry-load')"
      >
        {{ MESSAGES.termSelector.retryLoad }}
      </button>
    </div>

    <div v-else-if="filteredTerms.length === 0" class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-semibold leading-6 text-slate-600">{{ MESSAGES.termSelector.emptyCategory }}</p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="term in filteredTerms"
        :key="term.id"
        type="button"
        class="group min-h-36 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
        @click="emit('select', term)"
      >
        <span
          class="inline-flex rounded-full px-3 py-1 text-xs font-bold"
          :class="
            term.category === MESSAGES.termSelector.civicsCategory
              ? 'bg-blue-50 text-blue-700'
              : 'bg-green-50 text-green-700'
          "
        >
          {{ term.category }}
        </span>
        <h2 class="mt-5 text-xl font-bold text-slate-950 group-hover:text-blue-700">{{ term.name }}</h2>
        <p class="mt-3 text-sm leading-6 text-slate-500">{{ MESSAGES.termSelector.cardActionHint }}</p>
      </button>
    </div>
  </section>
</template>
