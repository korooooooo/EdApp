<script setup lang="ts">
import { computed, ref } from 'vue'
import LoadingDots from './LoadingDots.vue'
import { MESSAGES } from '@shared/messages'
import type { Term } from '@shared/types'
import { useLearningHistory } from '../composables/useLearningHistory'

const { getTermHistory, totalAttempts, topWeakTag } = useLearningHistory()

type FieldFilter = (typeof MESSAGES.termSelector.fieldOptions)[number]
type GradeFilter = (typeof MESSAGES.termSelector.gradeOptions)[number]

const props = defineProps<{
  terms: Term[]
  isLoading: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  select: [term: Term]
  'retry-load': []
}>()

const fieldOptions = MESSAGES.termSelector.fieldOptions
const gradeOptions = MESSAGES.termSelector.gradeOptions
const searchText = ref('')
const selectedField = ref<FieldFilter>(MESSAGES.termSelector.allOption)
const selectedGrade = ref<GradeFilter>(MESSAGES.termSelector.allOption)

const filteredTerms = computed(() => {
  const query = searchText.value.trim().toLowerCase()

  return props.terms.filter((term) => {
    const matchesField = selectedField.value === MESSAGES.termSelector.allOption || term.field === selectedField.value
    const matchesGrade = selectedGrade.value === MESSAGES.termSelector.allOption || term.grade === selectedGrade.value

    if (!matchesField || !matchesGrade) {
      return false
    }

    if (!query) {
      return true
    }

    return [term.name, term.unit, term.grade, term.field].some((value) => value.toLowerCase().includes(query))
  })
})

function fieldClass(field: Term['field']) {
  if (field === MESSAGES.termSelector.civicsCategory) {
    return 'bg-blue-50 text-blue-700'
  }

  if (field === MESSAGES.termSelector.historyCategory) {
    return 'bg-orange-50 text-orange-700'
  }

  return 'bg-green-50 text-green-700'
}

function masteryLabel(level: 'low' | 'medium' | 'high') {
  return MESSAGES.feedback.masteryLabels[level]
}

function masteryClass(level: 'low' | 'medium' | 'high') {
  if (level === 'high') return 'bg-green-50 text-green-700'
  if (level === 'medium') return 'bg-blue-50 text-blue-700'
  return 'bg-orange-50 text-orange-700'
}

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

    <div
      v-if="totalAttempts > 0"
      class="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 shadow-sm"
    >
      <p class="text-sm font-bold text-blue-800">{{ MESSAGES.termSelector.insightTitle }}</p>
      <p class="mt-2 text-sm leading-6 text-slate-700">
        {{ MESSAGES.termSelector.insightAttempts(totalAttempts) }}
      </p>
      <p v-if="topWeakTag && totalAttempts >= 3" class="mt-1 text-sm leading-6 text-slate-700">
        {{ MESSAGES.termSelector.insightTopWeakTag(topWeakTag) }}
      </p>
      <p v-else class="mt-1 text-sm leading-6 text-slate-500">
        {{ MESSAGES.termSelector.insightNotEnoughData }}
      </p>
    </div>

    <div class="mb-6 flex flex-col gap-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <label class="flex flex-1 flex-col gap-2">
          <span class="text-sm font-bold text-slate-600">{{ MESSAGES.termSelector.searchPlaceholder }}</span>
          <input
            v-model="searchText"
            type="search"
            class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            :placeholder="MESSAGES.termSelector.searchPlaceholder"
          />
        </label>

        <div class="flex items-center justify-between gap-3 text-sm font-bold text-slate-600 lg:justify-end">
          <span>{{ MESSAGES.termSelector.resultCount(filteredTerms.length) }}</span>
          <button
            type="button"
            class="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-300"
            :disabled="isLoading || filteredTerms.length === 0"
            @click="selectRandomTerm"
          >
            {{ MESSAGES.termSelector.randomButton }}
          </button>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div>
          <p class="mb-2 text-sm font-bold text-slate-600">{{ MESSAGES.termSelector.gradeFilterLabel }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="grade in gradeOptions"
              :key="grade"
              type="button"
              class="rounded-full border px-4 py-2 text-sm font-semibold transition"
              :class="
                selectedGrade === grade
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
              "
              @click="selectedGrade = grade"
            >
              {{ grade }}
            </button>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-bold text-slate-600">{{ MESSAGES.termSelector.fieldFilterLabel }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="field in fieldOptions"
              :key="field"
              type="button"
              class="rounded-full border px-4 py-2 text-sm font-semibold transition"
              :class="
                selectedField === field
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
              "
              @click="selectedField = field"
            >
              {{ field }}
            </button>
          </div>
        </div>
      </div>
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
        <div class="flex flex-wrap gap-2">
          <span class="inline-flex rounded-full px-3 py-1 text-xs font-bold" :class="fieldClass(term.field)">
            {{ term.field }}
          </span>
          <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {{ term.grade }}
          </span>
        </div>
        <h2 class="mt-5 text-xl font-bold text-slate-950 group-hover:text-blue-700">{{ term.name }}</h2>
        <p class="mt-2 text-sm font-semibold leading-6 text-slate-600">{{ term.unit }}</p>
        <div v-if="getTermHistory(term.id)" class="mt-3 flex flex-wrap gap-2">
          <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-bold"
            :class="masteryClass(getTermHistory(term.id)!.lastMastery)"
          >
            {{ MESSAGES.termSelector.historyLastMastery(masteryLabel(getTermHistory(term.id)!.lastMastery)) }}
          </span>
          <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {{ MESSAGES.termSelector.historyAttempts(getTermHistory(term.id)!.attempts) }}
          </span>
        </div>
        <p v-else class="mt-3 text-sm leading-6 text-slate-500">{{ MESSAGES.termSelector.cardActionHint }}</p>
      </button>
    </div>
  </section>
</template>
