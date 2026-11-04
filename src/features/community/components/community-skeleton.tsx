
function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
    />
  );
}

export function CommunityPostSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="space-y-4">
        {/* Author */}
        <div className="flex items-center gap-3">
          <SkeletonBlock className="size-10 shrink-0 rounded-full" />

          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-3.5 w-28" />
            <SkeletonBlock className="h-3 w-36" />
          </div>

          <SkeletonBlock className="h-6 w-28 rounded-full" />
        </div>

        {/* Category */}
        <SkeletonBlock className="h-6 w-24" />

        {/* Content */}
        <div className="space-y-3">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-3.5 w-full" />
          <SkeletonBlock className="h-3.5 w-full" />
          <SkeletonBlock className="h-3.5 w-2/3" />
        </div>

        {/* Evidence */}
        <SkeletonBlock className="aspect-video w-full rounded-xl" />

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex gap-4">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-20" />
          </div>

          <SkeletonBlock className="h-8 w-28 rounded-lg" />
        </div>
      </div>
    </article>
  );
}

export function CommunityFeedSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-label="Memuat postingan"
      aria-busy="true"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <CommunityPostSkeleton key={index} />
      ))}
    </div>
  );
}

export function ModerationLogsSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-label="Memuat riwayat moderasi"
      aria-busy="true"
    >
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <SkeletonBlock className="size-9 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex justify-between gap-3">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-24" />
            </div>

            <SkeletonBlock className="h-3 w-40" />

            <div className="flex gap-2">
              <SkeletonBlock className="h-6 w-28 rounded-full" />
              <SkeletonBlock className="h-6 w-28 rounded-full" />
            </div>

            {index === 0 && (
              <SkeletonBlock className="h-16 w-full rounded-lg" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
