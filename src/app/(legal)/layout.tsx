export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#080810] text-white antialiased">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8">
            <a href="/" className="text-violet-400 hover:text-violet-300 text-sm">← SocialHub</a>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
