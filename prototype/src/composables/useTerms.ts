import { onMounted, ref } from 'vue'
import { load } from 'js-yaml'
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

  return (
    typeof term.id === 'string' &&
    (term.category === '公民' || term.category === '歴史') &&
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
    throw new Error('terms.yaml に terms 配列がありません。')
  }

  const rawTerms = document.terms
  const invalidIndex = rawTerms.findIndex((term) => !isTerm(term))

  if (invalidIndex !== -1) {
    throw new Error(`terms.yaml の ${invalidIndex + 1} 番目の用語データが不正です。`)
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
        throw new Error(`terms.yaml の取得に失敗しました。status=${response.status}`)
      }

      const yamlText = await response.text()
      terms.value = parseTermsYaml(yamlText)
    } catch (error) {
      terms.value = []
      errorMessage.value = '用語データの読み込みに失敗しました。時間をおいて再読み込みしてください。'
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
