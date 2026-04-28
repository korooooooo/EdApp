# 説明トレ（仮）

中学社会の用語を、自分の言葉で説明する練習を行うAI学習プロトタイプです。

生徒が用語について説明し、AIが答えを教えるのではなく、質問で理解を深掘りします。

## 主な機能

- 中学社会の用語選択
- `public/terms.yaml` からの用語読み込み
- 生徒による説明入力
- AIによる問い返し
- 最大3回の対話
- 最終フィードバック
- mock / NVIDIA API の切替

## 技術スタック

- Vue 3
- Vite
- TypeScript
- Tailwind CSS
- Vercel Functions
- NVIDIA NIM API（OpenAI互換API）
- js-yaml

## ローカル起動

```bash
npm install
npm run dev
```

起動後、ブラウザで `http://localhost:5173/` を開きます。

## mockモード

APIキーなしで画面遷移や基本動作を確認するモードです。

`.env.local` に以下を設定します。

```env
VITE_USE_MOCK_AI=true
```

`VITE_USE_MOCK_AI` が未設定の場合も mock モードとして動きます。

## NVIDIA APIモード

NVIDIA NIM の OpenAI互換APIを使う場合は、`.env.local` に以下を設定します。

```env
VITE_USE_MOCK_AI=false
NVIDIA_API_KEY=replace-with-your-nvidia-api-key
NVIDIA_MODEL=deepseek-ai/deepseek-v4-pro
```

`NVIDIA_API_KEY` に `VITE_` を付けないでください。APIキーはサーバー側だけで使用します。

## 環境変数

| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `VITE_USE_MOCK_AI` | 任意 | `false` のときだけ `/api/dialogue` と `/api/feedback` を呼びます。未設定または `true` は mock モードです。 |
| `NVIDIA_API_KEY` | APIモード時に必須 | NVIDIA NIM APIキー。フロントエンドに露出させないため、`VITE_` を付けません。 |
| `NVIDIA_MODEL` | 任意 | 使用モデル。未設定時は `deepseek-ai/deepseek-v4-pro` です。 |

## Vercel公開手順

1. GitHubリポジトリをVercelに接続します。
2. VercelのProject SettingsでRoot Directoryを `prototype` にします。
3. Environment Variablesに以下を設定します。
   - `VITE_USE_MOCK_AI=false`
   - `NVIDIA_API_KEY`
   - `NVIDIA_MODEL=deepseek-ai/deepseek-v4-pro`
4. Build Commandは `npm run build` を使用します。
5. Deploy後、限定公開URLで動作確認します。

## APIキー管理の注意

- APIキーの実値をコード、README、ドキュメント、Issue、PRに書かないでください。
- `.env.local` はローカル専用です。コミットしないでください。
- `.env.local.example` にはダミー値だけを書きます。
- `NVIDIA_API_KEY` に `VITE_` を付けないでください。
- フロントエンドからNVIDIA APIを直接呼ばず、必ず `/api/dialogue` と `/api/feedback` を経由します。

## まだ実装していない機能

- ログイン
- 塾コード
- 学習履歴保存
- CSV出力
- 管理画面
- 課金
- 本番向けの詳細なアクセス制御

## 公開前チェック

- `npm run build` が成功する
- mockモードで基本フローが動く
- APIモードでNVIDIA NIMの応答が得られる
- 3回目入力後にフィードバックへ進む
- `.env.local` がGit管理に入っていない
- AI応答品質チェックリストを使って手動確認する

詳細は [公開前チェックリスト](./docs/pre-release-checklist.md) と [AI応答品質チェックリスト](./docs/ai-response-checklist.md) を参照してください。
