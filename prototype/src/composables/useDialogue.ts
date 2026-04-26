import { ref } from 'vue'
import { mockDialogueResponse, mockFeedback } from '../mocks/mockAi'
import type { AppPhase, Feedback, Message, Term } from '../shared/types'

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

    if (!term || !trimmedText || isLoading.value || !continueSession.value || turnCount.value >= 3) {
      return
    }

    messages.value.push({
      role: 'student',
      content: trimmedText,
    })

    isLoading.value = true

    try {
      const response = await mockDialogueResponse(trimmedText, term, messages.value)

      messages.value.push({
        role: 'ai',
        content: response.reply,
        weak_tag: response.weak_tag,
        question_type: response.question_type,
      })

      continueSession.value = response.continue_session

      if (!response.continue_session) {
        return
      }

      turnCount.value += 1

      if (turnCount.value >= 3) {
        feedback.value = await mockFeedback(term, messages.value)
        phase.value = 'feedback'
      }
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
