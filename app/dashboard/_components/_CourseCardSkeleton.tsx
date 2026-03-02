// ─── ShadowDrive AI — Course Card Skeleton ───

export default function CourseCardSkeleton() {
    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-foreground/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-foreground/10 rounded w-3/4" />
                <div className="h-3 bg-foreground/10 rounded w-1/2" />
            </div>
        </div>
    );
}
