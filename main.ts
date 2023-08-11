import { parse as cliParams } from "https://deno.land/std/flags/mod.ts";
import { parse } from "https://deno.land/x/xml/mod.ts"
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { cheerio } from "https://deno.land/x/cheerio@1.0.7/mod.ts";
import puppeteer from "https://deno.land/x/puppeteer@9.0.0/mod.ts";

type XmlType = {
  xml: {
    [params: string]: string | number
  }
  urlset: {
    url: {
      loc: string, lastmod: string, changefreq: string, priority: number 
    }[]
    "@xmlns": string
    "@xmlns:news": string
    "@xmlns:xhtml": string
    "@xmlns:mobile": string
    "@xmlns:image": string
    "@xmlns:video": string
  }
}

const openAIApiKey = config().OPENAI_API_KEY

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const args = cliParams(Deno.args);
  const url = args.url
  console.dir(url)

  try {
    const xml = await fetch(url).then((response) => response.text());
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    const data = parse(xml) as XmlType

    const urlObjects = data.urlset.url
    const urls = urlObjects.map((urlObject) => urlObject.loc)
    console.warn('urls => ', urls)
    console.warn('openAIApiKey => ', openAIApiKey)

    // const url1 = urls[5]
    // const response = await fetch(url1)
    // const html = await response.text()
    // const $ = cheerio.load(html)

    // console.warn('document => ', $('body').text())

    let contents = []

    for (const url of urls) {
      const response = await fetch(url)
      const html = await response.text()
      const $ = cheerio.load(html)
      const content = $('body').text()
    
      contents.push({ [url]: content })
      // const encoder = new TextEncoder()
      // const json = JSON.stringify({ document })
      // console.warn('document => ', $('body').text())
    }

    console.warn('contents => ', contents)

    // const encoder = new TextEncoder()
    // const file = await Deno.open('contents.json', { write: true, create: true })
    // await Deno.write(file, contents)
    await Deno.writeTextFile('contents.json', JSON.stringify(contents))
    console.log('file created.')
    // file.close()
  } catch (error) {
    console.error(error)
  }
}
