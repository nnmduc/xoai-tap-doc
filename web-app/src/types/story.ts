export interface StoryEntry {
  slug: string
  title: string
  summary?: string
  themes: string[]
  coverPath: string
  hasHtmlBook: boolean
}

export interface StoriesManifest {
  generatedAt: string
  stories: StoryEntry[]
}
