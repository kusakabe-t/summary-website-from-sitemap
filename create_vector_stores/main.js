const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const contents = require('../summary.json')

const openAIApiKey = undefined

class Document {
  pageContent
  metadata

  constructor(fields) {
    this.pageContent = fields.pageContent.toString()
    this.metadata = fields.metadata ?? ({})
  }
}

main()

async function main() {
	if (!openAIApiKey) throw new Error('Please check OpenAI API Key.')

	const documents = []
	for (const content of contents) {
		const document = await new Document({ pageContent: content.content, metadata: { id: content.id, url: content.url, summary: content.summary }})
		documents.push(document)
	}

	// ドキュメント本体を200文字ずつ区切る
	const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 500 })
	const splitDocuments = await textSplitter.splitDocuments(documents)

	// ベクターストアに保存
	const vectorStore = await HNSWLib.fromDocuments(splitDocuments, new OpenAIEmbeddings({ openAIApiKey: openAIApiKey }))
	await vectorStore.save('./hnswlib')
	console.log('saved vector store.')
}
