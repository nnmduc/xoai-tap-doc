export interface StoryEntry {
  slug: string
  title: string
  summary?: string
  themes: string[]
  coverPath: string
  hasHtmlBook: boolean
  hasAudio?: boolean
  readingLevel?: string
}

export interface StoriesManifest {
  generatedAt: string
  stories: StoryEntry[]
}
