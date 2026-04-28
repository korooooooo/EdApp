<script setup lang="ts">
import { computed, ref } from 'vue'
import LoadingDots from './LoadingDots.vue'
import { MESSAGES } from '@shared/messages'
import type { Message, Term } from '@shared/types'

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
const MAX_STUDENT_INPUT_LENGTH = 300

const remainingSubmissions = computed(() => Math.max(0, 3 - props.turnCount))
const introLines = computed(() => MESSAGES.dialogue.introLines(props.term.name))
const inputLength = computed(() => inputText.value.length)
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
        {{ MESSAGES.dialogue.back }}
      </button>
      <div class="text-right">
        <p class="text-sm font-semibold text-slate-500">{{ term.category }}</p>
        <h1 class="text-xl font-bold text-slate-950 sm:text-2xl">{{ term.name }}</h1>
      </div>
    </header>

    <main class="flex flex-1 flex-col rounded-lg border border-blue-100 bg-white shadow-sm">
      <div class="border-b border-slate-100 p-5 sm:p-6">
        <p class="max-w-2xl rounded-lg bg-blue-50 px-4 py-3 text-base leading-7 text-slate-800">
          {{ introLines[0] }}<br />
          {{ introLines[1] }}
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
          <span class="font-semibold text-slate-600">{{ MESSAGES.dialogue.remainingSubmissions }}</span>
          <span class="rounded-full bg-green-50 px-3 py-1 font-bold text-green-700">
            {{ remainingSubmissions }} {{ MESSAGES.dialogue.remainingSubmissionsUnit }}
          </span>
        </div>

        <form v-if="continueSession && turnCount < 3" class="flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
          <textarea
            v-model="inputText"
            rows="3"
            class="min-h-24 flex-1 resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-base leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
            :placeholder="MESSAGES.dialogue.inputPlaceholder"
            :disabled="isLoading"
            :maxlength="MAX_STUDENT_INPUT_LENGTH"
          />
          <div class="flex flex-col gap-2 sm:self-end">
            <p class="text-right text-xs font-semibold text-slate-500">
              {{ inputLength }}/{{ MAX_STUDENT_INPUT_LENGTH }}{{ MESSAGES.dialogue.inputLengthHelp }}
            </p>
            <button
              type="submit"
              class="rounded-lg bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300"
              :disabled="!canSubmit"
            >
              {{ MESSAGES.dialogue.submit }}
            </button>
          </div>
        </form>

        <div v-else-if="!continueSession" class="rounded-lg bg-orange-50 p-4">
          <p class="text-sm leading-6 text-orange-900">{{ MESSAGES.dialogue.finishNotice }}</p>
          <button
            type="button"
            class="mt-3 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200"
            @click="emit('finish')"
          >
            {{ MESSAGES.dialogue.finishEarly }}
          </button>
        </div>
      </div>
    </main>
  </section>
</template>
