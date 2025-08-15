// Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center justify-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} AdminPro. All rights reserved.
        </p>
        
      </div>
    </footer>
  );
}