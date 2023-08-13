import { PromptTemplate, Document } from 'https://esm.sh/langchain@0.0.113'
import { ChatOpenAI } from 'https://esm.sh/langchain@0.0.113/chat_models/openai'
import { loadSummarizationChain } from 'https://esm.sh/langchain@0.0.113/chains'
import { CharacterTextSplitter } from 'https://esm.sh/langchain@0.0.113/text_splitter'
import contents from './contents.json' assert { type: 'json' }

const openAIApiKey = ''

if (!openAIApiKey) throw new Error('Please Check OpenAI API Key.')

export interface DocumentInput<Metadata extends Record<string, any> = Record<string, any>> {
  pageContent: string;
  metadata?: Metadata;
}

class Document<Metadata extends Record<string, any> = Record<string, any>> implements DocumentInput
{
  pageContent: string;
  metadata: Metadata;

  constructor(fields: DocumentInput<Metadata>) {
    this.pageContent = fields.pageContent.toString()
    this.metadata = fields.metadata ?? ({} as Metadata)
  }
}

if (import.meta.main) {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4-0613',
    openAIApiKey,
    prefixMessages: [
      {
        role: 'system',
        content: '日本語で回答してください。'
      }
    ]
  })

	const textSplitter = new CharacterTextSplitter({ chunkSize: 8000, chunkOverlap: 500 })

	const prompt = new PromptTemplate({
		template: "{text}を300文字以内で要約してください。",
		inputVariables: ['text']
	 })
	const chain = loadSummarizationChain(llm, { type: "map_reduce", combineMapPrompt: prompt, combinePrompt: prompt })

	let summaryContents = []

	for (const [index, rawContent] of contents.entries()) {
		console.log('start: ', rawContent.url)
		// contents.jsonの内容を分割し、ChatGPTで要約
		const texts = await textSplitter.splitText(rawContent.content)
		const document = texts.map((content: string) => {
			return new Document({ pageContent: content })
		})
		const summaryResponse = await chain.call({
			input_documents: document
		})

		// 要約結果の表示
		console.log(`finish: ${index + 1}/${contents.length}`)
		console.warn('summary', summaryResponse.text)
		summaryContents.push({ id: rawContent.id, url: rawContent.url, content: rawContent.content, summary: summaryResponse.text })	
	}

	await Deno.writeTextFile('summary.json', JSON.stringify(summaryContents))
	console.log('file created.')
}
