export default function Footer() {
  return (
    <footer className="bg-white text-center py-2 text-sm text-gray-500 border-t font-red-rose dark:bg-zinc-900 dark:border-zinc-800" style={{ fontFamily: 'Red Rose, sans-serif' }}>
      © {new Date().getFullYear()} Cine Dashboard. All rights reserved.
    </footer>
  )
}