'use client';

// ─── ShadowDrive AI — Dashboard Page ───
// Thin orchestrator: routes between views based on state
// All state/handlers in _useDashboard.ts
// All views in _components/

import AuthButton from '@/components/AuthButton';
import ThemeToggle from '@/components/ThemeToggle';
import LessonPreview from '@/components/LessonPreview';
import AudioPlayer from '@/components/AudioPlayer';
import { ToastContainer } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { useDashboard } from './_useDashboard';
import CoursesTab from './_components/_CoursesTab';
import AiTab from './_components/_AiTab';
import CustomTab from './_components/_CustomTab';
import CategoryView from './_components/_CategoryView';
import SubcategoryView from './_components/_SubcategoryView';
import CourseDetailView from './_components/_CourseDetailView';

// ─── Dashboard Header ────────────────────────────────────────────────────────

function DashboardHeader() {
    return (
        <>
            <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex-shrink-0 min-w-[44px]">
                    <AuthButton />
                </div>
                <ThemeToggle />
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="mb-3 text-5xl">🚗</div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    <span className="text-gradient">Shadow</span>
                    <span className="text-foreground">Drive</span>
                    <span className="text-foreground-muted font-light ml-2 text-xl align-middle">AI</span>
                </h1>
                <p className="text-foreground-secondary text-center text-base max-w-xs leading-relaxed">
                    Araba kullanırken Hollandaca öğren
                </p>
                <div className="mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 opacity-60" />
            </div>
        </>
    );
}

// ─── Tab Switcher ───────────────────────────────────────────────────────────

function TabSwitcher({
    activeTab,
    onTabChange,
}: {
    activeTab: 'courses' | 'ai' | 'custom';
    onTabChange: (tab: 'courses' | 'ai' | 'custom') => void;
}) {
    return (
        <div className="tab-switcher flex rounded-2xl bg-card border border-border/50 p-1.5 mb-8">
            {(['courses', 'ai', 'custom'] as const).map((tab) => (
                <button
                    key={tab}
                    id={`tab-${tab}`}
                    onClick={() => onTabChange(tab)}
                    className={`flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider
                     transition-all duration-300 ${
                         activeTab === tab
                             ? 'bg-emerald-500 text-white dark:text-shadow-950 shadow-lg shadow-emerald-500/30'
                             : 'text-foreground-secondary hover:text-foreground'
                     }`}
                >
                    {tab === 'courses' ? '📚 Kurslar' : tab === 'ai' ? '🤖 AI' : '✍️ Metnim'}
                </button>
            ))}
        </div>
    );
}

// ─── Dashboard Main ─────────────────────────────────────────────────────────

function DashboardTabsView({ dash }: { dash: ReturnType<typeof useDashboard> }) {
    return (
        <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
            <ToastContainer toasts={dash.toasts} />

            <ConfirmModal
                open={!!dash.deleteConfirm}
                title="Bu dersi silmek istediğinize emin misiniz?"
                subtitle={dash.deleteConfirm?.title}
                confirmLabel="Sil"
                cancelLabel="İptal"
                variant="danger"
                onConfirm={() => {
                    if (!dash.deleteConfirm) return;
                    if (dash.deleteConfirm.type === 'ai') {
                        void dash.handleDeleteAiLesson(dash.deleteConfirm.id);
                    } else {
                        void dash.handleDeleteCustomLesson(dash.deleteConfirm.id);
                    }
                    dash.setDeleteConfirm(null);
                }}
                onCancel={() => dash.setDeleteConfirm(null)}
            />

            <DashboardHeader />
            <TabSwitcher activeTab={dash.activeTab} onTabChange={dash.setActiveTab} />

            {/* ── Courses Tab ── */}
            {dash.activeTab === 'courses' && (
                <CoursesTab
                    courses={dash.courses}
                    coursesLoading={dash.coursesLoading}
                    onCategoryClick={dash.handleCategoryClick}
                />
            )}

            {/* ── AI Tab ── */}
            {dash.activeTab === 'ai' && (
                <AiTab
                    session={dash.session}
                    isGenerating={dash.isGenerating}
                    isSaving={dash.isSaving}
                    lastGeneratedLesson={dash.lastGeneratedLesson}
                    savedAiLessons={dash.savedAiLessons}
                    editingLessonId={dash.editingLessonId}
                    editingTitle={dash.editingTitle}
                    onGenerate={dash.handleGenerate}
                    onDismissLastLesson={() => dash.setLastGeneratedLesson(null)}
                    onPreviewScenario={dash.handlePreviewScenario}
                    onPlayAiScenario={dash.handlePlayAiScenario}
                    onEditStart={dash.handleEditStart}
                    onEditChange={dash.setEditingTitle}
                    onEditCommit={(id) => void dash.handleRenameAiLesson(id, dash.editingTitle)}
                    onEditCancel={dash.handleEditCancel}
                    onDeleteRequest={(id, title) =>
                        dash.setDeleteConfirm({ type: 'ai', id, title })
                    }
                />
            )}

            {/* ── Custom Tab ── */}
            {dash.activeTab === 'custom' && (
                <CustomTab
                    session={dash.session}
                    isSaving={dash.isSaving}
                    lastCustomScenario={dash.lastCustomScenario}
                    savedCustomLessons={dash.savedCustomLessons}
                    editingLessonId={dash.editingLessonId}
                    editingTitle={dash.editingTitle}
                    onCustomSubmit={dash.handleCustomSubmit}
                    onDismissLastScenario={() => dash.setLastCustomScenario(null)}
                    onPreviewScenario={dash.handlePreviewScenario}
                    onPlayCustomScenario={dash.handlePlayCustomScenario}
                    onEditStart={dash.handleEditStart}
                    onEditChange={dash.setEditingTitle}
                    onEditCommit={(id) => void dash.handleRenameCustomLesson(id, dash.editingTitle)}
                    onEditCancel={dash.handleEditCancel}
                    onDeleteRequest={(id, title) =>
                        dash.setDeleteConfirm({ type: 'custom', id, title })
                    }
                />
            )}
        </main>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
    const dash = useDashboard();

    // ─── Preview Mode ───
    if (dash.viewState === 'preview' && dash.scenario) {
        return (
            <LessonPreview
                scenario={dash.scenario}
                onStartPlayback={dash.handleStartFromPreview}
                onBack={dash.handleBackFromPreview}
            />
        );
    }

    // ─── Playback Mode ───
    if (dash.viewState === 'playback' && dash.scenario) {
        return (
            <>
                <ToastContainer toasts={dash.toasts} />
                <AudioPlayer
                    scenario={dash.scenario}
                    startFromIndex={dash.startFromIndex}
                    onComplete={dash.handleComplete}
                    onBack={dash.handleBack}
                />
            </>
        );
    }

    // ─── Category View (select subcategories) ───
    if (dash.viewState === 'category' && dash.selectedCategory) {
        return (
            <CategoryView
                toasts={dash.toasts}
                selectedCategory={dash.selectedCategory}
                courses={dash.courses}
                onBack={dash.handleBackFromCategory}
                onSubcategoryClick={dash.handleSubcategoryClick}
            />
        );
    }

    // ─── Subcategory View (course list) ───
    if (dash.viewState === 'subcategory' && dash.selectedCategory) {
        return (
            <SubcategoryView
                toasts={dash.toasts}
                selectedCategory={dash.selectedCategory}
                selectedSubcategory={dash.selectedSubcategory}
                courses={dash.courses}
                progressMap={dash.progressMap}
                onBack={dash.handleBackFromSubcategory}
                onCourseClick={dash.handleCourseClick}
            />
        );
    }

    // ─── Course Detail View (lesson list) ───
    if (dash.viewState === 'course-detail' && dash.selectedCourse) {
        return (
            <CourseDetailView
                toasts={dash.toasts}
                selectedCourse={dash.selectedCourse}
                progressMap={dash.progressMap}
                resumeState={dash.resumeState}
                onBack={dash.handleBackFromCourseDetail}
                onLessonClick={dash.handleLessonClick}
                onPreviewClick={dash.handlePreviewClick}
                onResume={() => {
                    dash.handleResume();
                }}
                onRestart={() => {
                    void dash.handleRestartLesson();
                }}
                onDismissResume={() => dash.setResumeState(null)}
            />
        );
    }

    // ─── Dashboard (tabs view) ───
    return <DashboardTabsView dash={dash} />;
}
