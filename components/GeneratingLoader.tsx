'use client';

// ─── ShadowDrive AI — Skeleton Loader ───
// Shows animated placeholder lines while AI generates the scenario.
// Reduces perceived wait time compared to a spinner.

interface GeneratingLoaderProps {
    lineCount?: number;
}

export default function GeneratingLoader({ lineCount = 8 }: GeneratingLoaderProps) {
    return (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto px-4 py-8 animate-fade-in">
            {/* Header skeleton */}
            <div className="flex flex-col items-center gap-3 mb-4">
                <div className="h-3 w-32 rounded-full bg-gray-700 animate-pulse" />
                <div className="h-6 w-48 rounded-lg bg-gray-700/60 animate-pulse" />
            </div>

            {/* Line skeletons */}
            <div className="flex flex-col gap-3">
                {Array.from({ length: lineCount }, (_, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-shadow-800 border border-gray-700/30"
                        style={{ animationDelay: `${i * 150}ms` }}
                    >
                        {/* Line number */}
                        <div className="w-7 h-7 rounded-lg bg-gray-700 animate-pulse flex-shrink-0" />

                        {/* Text lines */}
                        <div className="flex-1 flex flex-col gap-2">
                            <div
                                className="h-4 rounded-md bg-emerald-500/10 animate-pulse"
                                style={{ width: `${60 + Math.random() * 35}%` }}
                            />
                            <div
                                className="h-3 rounded-md bg-gray-700/40 animate-pulse"
                                style={{ width: `${50 + Math.random() * 40}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Status text */}
            <p className="text-center text-gray-500 text-sm animate-pulse mt-2">
                Senaryo oluşturuluyor...
            </p>
        </div>
    );
}
