import { parse as cliParams } from "https://deno.land/std/flags/mod.ts";
import { parse } from "https://deno.land/x/xml/mod.ts"

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

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

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
    // console.warn('data => ', data)
  } catch (error) {
    console.error(error)
  }
}
