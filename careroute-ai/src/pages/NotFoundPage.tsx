import { ButtonLink, PageShell } from '../components/ui'

export function NotFoundPage() {
  return (
    <PageShell narrow title="Page not found" intro="The page you're looking for doesn't exist.">
      <ButtonLink to="/">Back to home</ButtonLink>
    </PageShell>
  )
}
