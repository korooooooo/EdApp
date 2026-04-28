<script setup lang="ts">
import DialogueScreen from './components/DialogueScreen.vue'
import FeedbackScreen from './components/FeedbackScreen.vue'
import TermSelector from './components/TermSelector.vue'
import { useDialogue } from './composables/useDialogue'
import { useTerms } from './composables/useTerms'

const {
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
} = useDialogue()

const {
  terms,
  isLoading: isTermsLoading,
  errorMessage,
  loadTerms,
} = useTerms()
</script>

<template>
  <TermSelector
    v-if="phase === 'selecting'"
    :terms="terms"
    :is-loading="isTermsLoading"
    :error-message="errorMessage"
    @select="selectTerm"
    @retry-load="loadTerms"
  />

  <DialogueScreen
    v-else-if="phase === 'dialoguing' && selectedTerm"
    :term="selectedTerm"
    :messages="messages"
    :turn-count="turnCount"
    :is-loading="isLoading"
    :continue-session="continueSession"
    @back="resetToSelector"
    @submit="submitStudentMessage"
    @finish="finishEarly"
  />

  <FeedbackScreen
    v-else-if="phase === 'feedback' && selectedTerm && feedback"
    :term="selectedTerm"
    :feedback="feedback"
    @select-another="resetToSelector"
    @retry="retrySameTerm"
  />
</template>
