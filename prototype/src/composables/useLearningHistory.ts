import { computed, ref } from 'vue'
import type { Feedback, WeakTag } from '@shared/types'

const STORAGE_KEY = 'learning-history-v1'

export interface TermHistory {
  attempts: number
  lastMastery: Feedback['mastery_level']
  lastWeakTag: WeakTag
  lastAttemptedAt: string
  weakTagCounts: Partial<Record<WeakTag, number>>
}

export interface LearningHistory {
  terms: Record<string, TermHistory>
}

function emptyHistory(): LearningHistory {
  return { terms: {} }
}

function readStorage(): LearningHistory {
  if (typeof window === 'undefined') {
    return emptyHistory()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return emptyHistory()
    }
    const parsed = JSON.parse(raw) as LearningHistory
    if (!parsed || typeof parsed !== 'object' || !parsed.terms) {
      return emptyHistory()
    }
    return parsed
  } catch {
    return emptyHistory()
  }
}

function writeStorage(history: LearningHistory) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // localStorage が使えない環境では何もしない
  }
}

const history = ref<LearningHistory>(readStorage())

export function useLearningHistory() {
  function recordFeedback(termId: string, feedback: Feedback) {
    const current = history.value.terms[termId]
    const counts: Partial<Record<WeakTag, number>> = { ...(current?.weakTagCounts ?? {}) }
    counts[feedback.weak_tag] = (counts[feedback.weak_tag] ?? 0) + 1

    const next: TermHistory = {
      attempts: (current?.attempts ?? 0) + 1,
      lastMastery: feedback.mastery_level,
      lastWeakTag: feedback.weak_tag,
      lastAttemptedAt: new Date().toISOString(),
      weakTagCounts: counts,
    }

    history.value = {
      ...history.value,
      terms: { ...history.value.terms, [termId]: next },
    }
    writeStorage(history.value)
  }

  function getTermHistory(termId: string): TermHistory | undefined {
    return history.value.terms[termId]
  }

  const totalAttempts = computed(() =>
    Object.values(history.value.terms).reduce((sum, item) => sum + item.attempts, 0),
  )

  const topWeakTag = computed<WeakTag | null>(() => {
    const aggregate = new Map<WeakTag, number>()
    for (const term of Object.values(history.value.terms)) {
      for (const [tag, count] of Object.entries(term.weakTagCounts)) {
        if (count === undefined) continue
        // 「大きな不足なし」「システムエラー」は傾向分析から除外
        if (tag === '大きな不足なし' || tag === 'システムエラー') continue
        aggregate.set(tag as WeakTag, (aggregate.get(tag as WeakTag) ?? 0) + count)
      }
    }
    let best: WeakTag | null = null
    let bestCount = 0
    for (const [tag, count] of aggregate) {
      if (count > bestCount) {
        best = tag
        bestCount = count
      }
    }
    return best
  })

  function clearHistory() {
    history.value = emptyHistory()
    writeStorage(history.value)
  }

  return {
    history,
    recordFeedback,
    getTermHistory,
    totalAttempts,
    topWeakTag,
    clearHistory,
  }
}
