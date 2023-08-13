import contents from './contents.json' assert { type: 'json' }
import { PromptTemplate, ChatOpenAI, loadSummarizationChain, CharacterTextSplitter} from './depth.ts'
import { Document } from './types.ts'

const openAIApiKey = ''

if (!contents) throw new Error('Please run fetch_websites_contents.')
if (!openAIApiKey) throw new Error('Please Check OpenAI API Key.')

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

	const summaryContents = []

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
