import Link from 'next/link';
import type { Tag } from '@/lib/types';

export function TagFilter({ tags }: { tags: Tag[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/etiket/${tag.slug}`}
          className="flex-shrink-0 px-4 py-2 rounded-full bg-card border border-border-light text-sm font-medium hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
        >
          {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
