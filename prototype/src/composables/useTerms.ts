import { onMounted, ref } from 'vue'
import { load } from 'js-yaml'
import { MESSAGES } from '@shared/messages'
import type { Term } from '@shared/types'

interface TermsYamlDocument {
  terms?: unknown
}

const TERMS_YAML_PATH = '/terms.yaml'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isTerm(value: unknown): value is Term {
  if (!value || typeof value !== 'object') {
    return false
  }

  const term = value as Record<string, unknown>
  const termCategories = MESSAGES.termSelector.termCategories as readonly string[]
  const termGrades = MESSAGES.termSelector.termGrades as readonly string[]
  const termFields = MESSAGES.termSelector.termFields as readonly string[]

  return (
    typeof term.id === 'string' &&
    typeof term.category === 'string' &&
    termCategories.includes(term.category) &&
    typeof term.grade === 'string' &&
    termGrades.includes(term.grade) &&
    typeof term.field === 'string' &&
    termFields.includes(term.field) &&
    typeof term.unit === 'string' &&
    typeof term.name === 'string' &&
    typeof term.reference_text === 'string' &&
    isStringArray(term.key_points) &&
    isStringArray(term.common_mistakes) &&
    isStringArray(term.question_hints)
  )
}

function parseTermsYaml(yamlText: string): Term[] {
  const document = load(yamlText) as TermsYamlDocument

  if (!document || !Array.isArray(document.terms)) {
    throw new Error(MESSAGES.terms.schemaMissing)
  }

  const rawTerms = document.terms
  const invalidIndex = rawTerms.findIndex((term) => !isTerm(term))

  if (invalidIndex !== -1) {
    throw new Error(MESSAGES.terms.invalidTerm(invalidIndex))
  }

  return rawTerms as Term[]
}

export function useTerms() {
  const terms = ref<Term[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function loadTerms() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await fetch(TERMS_YAML_PATH, { cache: 'no-cache' })

      if (!response.ok) {
        throw new Error(MESSAGES.terms.fetchFailed(response.status))
      }

      const yamlText = await response.text()
      terms.value = parseTermsYaml(yamlText)
    } catch (error) {
      terms.value = []
      errorMessage.value = MESSAGES.terms.loadFailed
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(loadTerms)

  return {
    terms,
    isLoading,
    errorMessage,
    loadTerms,
  }
}
