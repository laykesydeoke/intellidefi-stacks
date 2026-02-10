import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-700">404</h1>
        <p className="mt-4 text-lg text-gray-400">Page not found</p>
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
