export type XmlType = {
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

interface DocumentInput<Metadata extends Record<string, any> = Record<string, any>> {
  pageContent: string;
  metadata?: Metadata;
}

export class Document<Metadata extends Record<string, any> = Record<string, any>> implements DocumentInput
{
  pageContent: string;
  metadata: Metadata;

  constructor(fields: DocumentInput<Metadata>) {
    this.pageContent = fields.pageContent.toString()
    this.metadata = fields.metadata ?? ({} as Metadata)
  }
}