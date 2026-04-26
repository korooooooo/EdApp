import type { Term } from '@shared/types'

// Step 1 検証用に5語抜粋。Step 2 で terms.yaml から10語読み込む。
export const mockTerms: Term[] = [
  {
    id: 'term_001',
    category: '公民',
    name: '三権分立',
    reference_text: '',
    key_points: [],
    common_mistakes: [],
    question_hints: [],
  },
  {
    id: 'term_002',
    category: '公民',
    name: '国民主権',
    reference_text: '',
    key_points: [],
    common_mistakes: [],
    question_hints: [],
  },
  {
    id: 'term_004',
    category: '公民',
    name: '需要と供給',
    reference_text: '',
    key_points: [],
    common_mistakes: [],
    question_hints: [],
  },
  {
    id: 'term_007',
    category: '歴史',
    name: '参勤交代',
    reference_text: '',
    key_points: [],
    common_mistakes: [],
    question_hints: [],
  },
  {
    id: 'term_008',
    category: '歴史',
    name: '地租改正',
    reference_text: '',
    key_points: [],
    common_mistakes: [],
    question_hints: [],
  },
]
