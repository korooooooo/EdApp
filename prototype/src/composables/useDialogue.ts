import { ref } from 'vue'
import type { AppPhase, Feedback, Message, Term } from '@shared/types'
import { requestDialogueResponse, requestFeedback } from '../services/aiClient'

const MAX_STUDENT_MESSAGES = 3

export function useDialogue() {
  const phase = ref<AppPhase>('selecting')
  const selectedTerm = ref<Term | null>(null)
  const messages = ref<Message[]>([])
  const turnCount = ref(0)
  const isLoading = ref(false)
  const feedback = ref<Feedback | null>(null)
  const continueSession = ref(true)

  function resetDialogueState() {
    messages.value = []
    turnCount.value = 0
    isLoading.value = false
    feedback.value = null
    continueSession.value = true
  }

  function selectTerm(term: Term) {
    selectedTerm.value = term
    resetDialogueState()
    phase.value = 'dialoguing'
  }

  async function submitStudentMessage(text: string) {
    const term = selectedTerm.value
    const trimmedText = text.trim()

    if (!term || !trimmedText || isLoading.value || !continueSession.value || turnCount.value >= MAX_STUDENT_MESSAGES) {
      return
    }

    messages.value.push({
      role: 'student',
      content: trimmedText,
    })

    isLoading.value = true

    try {
      const currentTurnCount = turnCount.value
      const nextTurnCount = turnCount.value + 1
      turnCount.value = nextTurnCount

      // 3回目の生徒入力後は、AI問い返しを出さずにフィードバックへ進む。
      if (nextTurnCount >= MAX_STUDENT_MESSAGES) {
        feedback.value = await requestFeedback({
          term,
          messages: messages.value,
        })
        phase.value = 'feedback'
        return
      }

      const response = await requestDialogueResponse({
        term,
        messages: messages.value,
        student_message: trimmedText,
        turn_count: currentTurnCount,
      })

      continueSession.value = response.continue_session
      // continue_session が false の場合は逸脱終了。
      // AI終了メッセージを表示し、フィードバック生成はスキップする。

      messages.value.push({
        role: 'ai',
        content: response.reply,
        weak_tag: response.weak_tag,
        question_type: response.question_type,
      })
    } finally {
      isLoading.value = false
    }
  }

  function resetToSelector() {
    selectedTerm.value = null
    resetDialogueState()
    phase.value = 'selecting'
  }

  function retrySameTerm() {
    if (!selectedTerm.value) {
      resetToSelector()
      return
    }

    resetDialogueState()
    phase.value = 'dialoguing'
  }

  function finishEarly() {
    resetToSelector()
  }

  return {
    phase,
    selectedTerm,
    messages,
    turnCount,
    isLoading,
    feedback,
    continueSession,
    selectTerm,
    submitStudentMessage,
    resetToSelector,
    retrySameTerm,
    finishEarly,
  }
}
