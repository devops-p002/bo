export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="max-w-lg">
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-surface-50/60 text-sm">{title} isn't live yet - we're building it out. Check back soon.</p>
      </div>
    </div>
  );
}
