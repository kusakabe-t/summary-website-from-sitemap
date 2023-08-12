import { cliParams, cheerio, parse } from './depth.ts'

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

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const args = cliParams(Deno.args);
  const url = args.url

  try {
    const xml = await fetch(url).then((response) => response.text());
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    const data = parse(xml) as XmlType

    const urlObjects = data.urlset.url
    const urls = urlObjects.map((urlObject) => urlObject.loc)

    let contents = []

    for (const url of urls) {
      const response = await fetch(url)
      const html = await response.text()
      const $ = cheerio.load(html)

      const content = $('body').text()    
      contents.push({ [url]: content })
    }

    await Deno.writeTextFile('contents.json', JSON.stringify(contents))
    console.log('file created.')
  } catch (error) {
    console.error(error)
  }
}
