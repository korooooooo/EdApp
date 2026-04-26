<script setup lang="ts">
import { computed } from 'vue'
import type { Feedback, Term } from '../shared/types'

const props = defineProps<{
  term: Term
  feedback: Feedback
}>()

const emit = defineEmits<{
  selectAnother: []
  retry: []
}>()

const masteryLabel = computed(() => {
  const labels: Record<Feedback['mastery_level'], string> = {
    low: 'もう少し',
    medium: 'あと一歩',
    high: 'よく理解できています',
  }

  return labels[props.feedback.mastery_level]
})
</script>

<template>
  <section class="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-8 sm:px-8">
    <div class="rounded-lg border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
      <p class="mb-2 text-sm font-bold text-blue-700">フィードバック</p>
      <h1 class="text-2xl font-bold text-slate-950 sm:text-3xl">{{ term.name }} のセッションが終わりました</h1>

      <div class="mt-6 grid gap-4">
        <section class="rounded-lg border border-green-100 bg-green-50 p-4">
          <h2 class="text-sm font-bold text-green-800">良かった点</h2>
          <p class="mt-2 text-base leading-7 text-slate-800">{{ feedback.good_point }}</p>
        </section>

        <section class="rounded-lg border border-orange-100 bg-orange-50 p-4">
          <h2 class="text-sm font-bold text-orange-800">次に意識する点</h2>
          <p class="mt-2 text-base leading-7 text-slate-800">{{ feedback.next_point }}</p>
        </section>

        <section class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 class="text-sm font-bold text-slate-700">模範解答</h2>
          <p class="mt-2 text-base leading-7 text-slate-800">{{ feedback.model_answer }}</p>
        </section>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span class="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700">理解度: {{ masteryLabel }}</span>
        <span class="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-600">{{ feedback.weak_tag }}</span>
      </div>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          @click="emit('selectAnother')"
        >
          別の用語に挑戦
        </button>
        <button
          type="button"
          class="rounded-lg bg-blue-600 px-5 py-3 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          @click="emit('retry')"
        >
          もう一度同じ用語に挑戦
        </button>
      </div>
    </div>
  </section>
</template>
