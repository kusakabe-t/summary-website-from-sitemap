import { cliParams, cheerio, parse } from './depth.ts'
import { XmlType } from './types.ts'

if (import.meta.main) {
  const args = cliParams(Deno.args);
  const url = args.url

  try {
    const xml = await fetch(url).then((response) => response.text());
    // parseメソッドの返り値の型を修正
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    const data = parse(xml) as XmlType

    // xml構造からurlのみを取得
    const urlObjects = data.urlset.url
    const urls = urlObjects.map((urlObject) => urlObject.loc)

    const contents = []

    for (const [index, url] of urls.entries()) {
      console.log(url)
      const response = await fetch(url)
      const html = await response.text()
      const $ = cheerio.load(html)
      const rawContent = $('body').text()

      // body内にあるjsonを消すために追加
      const jsonContent = $('body')[0].children[1].children[0].data
      const content = rawContent.replace(jsonContent, '')

      console.log(`finish ${index + 1}/${urls.length}`)
      contents.push({ id: index + 1, url, content })
    }

    await Deno.writeTextFile('contents.json', JSON.stringify(contents))
    console.log('file created.')
  } catch (error) {
    console.error(error)
  }
}
