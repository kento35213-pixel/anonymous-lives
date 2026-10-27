# 名もなき偉人劇場 — GitHub / Cloudflare 公開版

日本24人・世界37人、計61人の生涯を8幕のアニメーションで観て当てるクイズです。
自由入力・4択・ヒント・人物図鑑・スコア保存・速度調整・任意の音と朗読に対応しています。

## 1. ZIPを解凍してGitHubへアップロード

1. このZIPを解凍します。
2. GitHubで新しいリポジトリを作成します。
3. 解凍した中身をアップロードしてコミットします。

**リポジトリの一番上に `wrangler.jsonc` と `package.json`、`dist` フォルダが並ぶ形にしてください。ZIPそのものをGitHubに置くだけでは公開できません。**

```text
リポジトリ直下
├── wrangler.jsonc
├── package.json
├── README.md
├── scripts/check-build.mjs
├── tests/core.test.mjs
└── dist/
    ├── index.html
    ├── app.js
    ├── stage.js
    ├── core.js
    ├── people.js
    ├── world.js
    ├── style.css
    └── icon.svg
```

## 2. Cloudflare WorkersでGitHub連携

Cloudflareの「Workers & Pages」で作成を開始し、**WorkersのGitリポジトリ連携**から上記リポジトリを選びます。画面の項目名は変更される場合があります。

| 項目 | 入力値 |
| --- | --- |
| Worker名 | `anonymous-lives-theater` |
| 本番ブランチ | `main`（GitHubの既定ブランチに合わせる） |
| ルートディレクトリ | リポジトリ直下（空欄または `/`） |
| ビルドコマンド | `npm run build` |
| デプロイコマンド | `npx wrangler deploy` |
| 環境変数 | アプリ用の設定は不要 |

通常は依存関係が自動インストールされます。インストールコマンドの入力欄がある場合は `npm install`、Node.jsのバージョンを指定する場合は22以降を使用してください。

Worker名を変更する場合は、**`wrangler.jsonc` の `name` も同じ名前に変更**してください。英小文字・数字・ハイフンを使用します。

`dist` 内の完成済みファイルを配信するため、コンパイル処理やWorkerの `main` ファイルは不要です。`assets.directory` が配信先を指定しています。Workersの手順なので、Pagesの「出力ディレクトリ」欄を使う設定とは異なります。

デプロイが成功するとCloudflareに公開URLが表示されます。GitHub連携後は、対象ブランチへの更新コミットが自動デプロイの対象になります。独自ドメインはCloudflare側で追加できます。

## 3. PCのターミナルから公開する場合

Node.js 22以降を用意し、解凍したフォルダ内で実行します。

```bash
npm install
npm run build
npm test
npx wrangler login
npm run deploy
```

ローカルで遊ぶ場合は `npm run dev` を使い、表示されたURLをブラウザで開きます。ES modulesを使用するため、`index.html` をファイルとして直接開く方法は対象外です。

## 公開版について

- このZIPはCloudflareで独立して動く静的サイトです。ChatGPTへのログインやAPIキーは必要ありません。
- 公開設定のCloudflare URLは、URLを知っている人がアクセスできます。
- 進捗・スコアは各ブラウザのローカルストレージに保存されます。端末間では同期されません。
- 朗読は端末・ブラウザの音声機能を利用します。音は操作でオンにしてください。
- 人物の服装・背景・動作と称号はゲーム独自の演出です。史料に不確かな点は人物解説で注記しています。
- 各人物の参考資料へのリンクはゲーム内の答え合わせ画面にあります。

## 設定の参考

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Static Assetsを始める](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Wranglerコマンド](https://developers.cloudflare.com/workers/wrangler/commands/)
