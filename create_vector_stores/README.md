# hnswlib (ベクターストア) の保存
あらかじめ、以下の2つを済ませておくこと

1. ウェブサイトのコンテンツ取得 (fetch_websites_contents)

2. コンテンツを要約する (summary)

コンテンツ要約は1回の実行に、5ドルぐらいかかる。

以下のコマンドで、ベクターストアに結果を保存する。

```
node main.js
```