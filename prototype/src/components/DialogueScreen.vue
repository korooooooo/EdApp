<script setup lang="ts">
import { computed, ref } from 'vue'
import LoadingDots from './LoadingDots.vue'
import type { Message, Term } from '../shared/types'

const props = defineProps<{
  term: Term
  messages: Message[]
  turnCount: number
  isLoading: boolean
  continueSession: boolean
}>()

const emit = defineEmits<{
  back: []
  submit: [text: string]
  finish: []
}>()

const inputText = ref('')

const remainingQuestions = computed(() => Math.max(0, 3 - props.turnCount))
const canSubmit = computed(
  () => inputText.value.trim().length > 0 && !props.isLoading && props.continueSession && props.turnCount < 3,
)

function submit() {
  if (!canSubmit.value) {
    return
  }

  emit('submit', inputText.value)
  inputText.value = ''
}
</script>

<template>
  <section class="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-5 sm:px-8 sm:py-8">
    <header class="mb-5 flex items-center justify-between gap-3">
      <button
        type="button"
        class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
        @click="emit('back')"
      >
        戻る
      </button>
      <div class="text-right">
        <p class="text-sm font-semibold text-slate-500">{{ term.category }}</p>
        <h1 class="text-xl font-bold text-slate-950 sm:text-2xl">{{ term.name }}</h1>
      </div>
    </header>

    <main class="flex flex-1 flex-col rounded-lg border border-blue-100 bg-white shadow-sm">
      <div class="border-b border-slate-100 p-5 sm:p-6">
        <p class="max-w-2xl rounded-lg bg-blue-50 px-4 py-3 text-base leading-7 text-slate-800">
          『{{ term.name }}』という言葉を聞いて、どんなイメージが浮かびますか？<br />
          正解じゃなくて大丈夫です。
        </p>
      </div>

      <div class="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
        <div
          v-for="(message, index) in messages"
          :key="`${message.role}-${index}`"
          class="flex"
          :class="message.role === 'student' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[72%] sm:text-base"
            :class="
              message.role === 'student'
                ? 'rounded-br-sm bg-blue-600 text-white'
                : 'rounded-bl-sm border border-slate-200 bg-slate-50 text-slate-800'
            "
          >
            {{ message.content }}
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-start">
          <div class="rounded-lg rounded-bl-sm border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
            <LoadingDots />
          </div>
        </div>
      </div>

      <div class="border-t border-slate-100 p-4 sm:p-5">
        <div class="mb-3 flex items-center justify-between gap-3 text-sm">
          <span class="font-semibold text-slate-600">残り質問数</span>
          <span class="rounded-full bg-green-50 px-3 py-1 font-bold text-green-700">{{ remainingQuestions }} 回</span>
        </div>

        <form v-if="continueSession && turnCount < 3" class="flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
          <textarea
            v-model="inputText"
            rows="3"
            class="min-h-24 flex-1 resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-base leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
            placeholder="自分の言葉で説明してみましょう"
            :disabled="isLoading"
          />
          <button
            type="submit"
            class="rounded-lg bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 sm:self-end"
            :disabled="!canSubmit"
          >
            送信
          </button>
        </form>

        <div v-else-if="!continueSession" class="rounded-lg bg-orange-50 p-4">
          <p class="text-sm leading-6 text-orange-900">このセッションはここで終了できます。</p>
          <button
            type="button"
            class="mt-3 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200"
            @click="emit('finish')"
          >
            今日はここまでにする
          </button>
        </div>
      </div>
    </main>
  </section>
</template>
