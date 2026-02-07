export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} IntelliDeFi Protocol. Built on Stacks.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/laykesydeoke/intellidefi-stacks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://docs.stacks.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Stacks Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
