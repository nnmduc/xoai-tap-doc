import { AnimatePresence } from 'framer-motion'
import { useHashRoute } from '@/hooks/use-hash-route'
import { useStoriesManifest } from '@/hooks/use-stories-manifest'
import { LibraryScreen } from '@/components/library/library-screen'
import { ReaderScreen } from '@/components/reader/reader-screen'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { ErrorScreen } from '@/components/shared/error-screen'

export default function App() {
  const { route, navigate } = useHashRoute()
  const manifestState = useStoriesManifest()

  if (manifestState.status === 'loading') return <LoadingScreen />
  if (manifestState.status === 'error') return <ErrorScreen message={manifestState.message} />

  const stories = manifestState.data.stories

  const activeStory =
    route.view === 'reader' ? stories.find((s) => s.slug === route.slug) ?? null : null

  return (
    <div className="relative min-h-screen bg-brand-bg overflow-hidden">
      <LibraryScreen stories={stories} onSelectStory={(story) => navigate.toReader(story.slug)} />

      <AnimatePresence>
        {route.view === 'reader' && activeStory && (
          <ReaderScreen
            key={activeStory.slug}
            story={activeStory}
            onBack={navigate.toLibrary}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
