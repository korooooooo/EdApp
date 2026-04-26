import type { DialogueResponse, Feedback, Message, Term } from '../shared/types'

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export async function mockDialogueResponse(
  inputText: string,
  _term: Term,
  _messages: Message[],
): Promise<DialogueResponse> {
  await wait(600)

  if (['終了', 'やめる', 'ふざけ'].some((keyword) => inputText.includes(keyword))) {
    return {
      reply: '今日はここまでにしましょうか。気が向いたら、またチャレンジしてみてくださいね。',
      weak_tag: '話題逸脱',
      question_type: '終了を提案する',
      continue_session: false,
    }
  }

  return {
    reply: 'いいですね。なぜそう考えたのか、もう少し教えてもらえますか？',
    weak_tag: '理由説明不足',
    question_type: '理由を問う',
    continue_session: true,
  }
}

export async function mockFeedback(_term: Term, _messages: Message[]): Promise<Feedback> {
  await wait(600)

  return {
    good_point: '自分の言葉で説明しようとした点が良かったです。',
    next_point: '次は理由まで説明するともっと良くなります。',
    model_answer: 'これはダミーの模範解答です。API接続後にAIが生成します。',
    weak_tag: '理由説明不足',
    mastery_level: 'medium',
  }
}
