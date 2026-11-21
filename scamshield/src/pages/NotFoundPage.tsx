import { ButtonLink } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-400">That address does not exist on ScamShield.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink to="/">Home</ButtonLink>
        <ButtonLink to="/analyse" variant="secondary">
          Check something
        </ButtonLink>
      </div>
    </div>
  );
}
