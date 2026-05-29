import Link from "next/link";
import { CATEGORIES } from "@/data/categories";

export function CategoryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={cat.href}
          className="card-surface group flex flex-col p-5 transition hover:border-shifaa-green/40 hover:shadow-lift"
        >
          <span className="text-2xl" aria-hidden>
            {cat.icon}
          </span>
          <h3 className="mt-3 font-medium text-shifaa-ink group-hover:text-shifaa-green">
            {cat.label}
          </h3>
          <p className="mt-1 text-sm text-shifaa-muted">{cat.description}</p>
        </Link>
      ))}
    </div>
  );
}
