<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Term } from '@shared/types'

type CategoryFilter = 'すべて' | Term['category']

const props = defineProps<{
  terms: Term[]
}>()

const emit = defineEmits<{
  select: [term: Term]
}>()

const categories: CategoryFilter[] = ['すべて', '公民', '歴史']
const selectedCategory = ref<CategoryFilter>('すべて')

const filteredTerms = computed(() => {
  if (selectedCategory.value === 'すべて') {
    return props.terms
  }

  return props.terms.filter((term) => term.category === selectedCategory.value)
})

function selectRandomTerm() {
  if (filteredTerms.value.length === 0) {
    return
  }

  const index = Math.floor(Math.random() * filteredTerms.value.length)
  emit('select', filteredTerms.value[index])
}
</script>

<template>
  <section class="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8 lg:py-12">
    <div class="mb-8">
      <p class="mb-2 text-sm font-semibold text-blue-700">中学社会・説明問題対策</p>
      <h1 class="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">説明トレ（仮）</h1>
      <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
        中学社会の用語を、自分の言葉で説明する練習をしましょう。
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
        class="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200"
        @click="selectRandomTerm"
      >
        ランダムで出題
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="term in filteredTerms"
        :key="term.id"
        type="button"
        class="group min-h-36 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
        @click="emit('select', term)"
      >
        <span
          class="inline-flex rounded-full px-3 py-1 text-xs font-bold"
          :class="term.category === '公民' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'"
        >
          {{ term.category }}
        </span>
        <h2 class="mt-5 text-xl font-bold text-slate-950 group-hover:text-blue-700">{{ term.name }}</h2>
        <p class="mt-3 text-sm leading-6 text-slate-500">クリックして説明練習を始めます。</p>
      </button>
    </div>
  </section>
</template>
