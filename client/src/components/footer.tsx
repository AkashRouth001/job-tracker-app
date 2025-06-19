export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 JobTracker Pro. Stay organized in your job search.
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Built with React & Tailwind CSS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}