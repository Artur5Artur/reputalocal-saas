import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <h1 className="font-display text-4xl">Pagina niet gevonden</h1>
      <Link href="/" className="mt-6 text-brass-600 underline">
        Terug naar ReputaLocal
      </Link>
    </main>
  );
}
