// ─── ShadowDrive AI — Core Data Types ───
// Re-exported from @shadowdrive/shared package for canonical type source

export type {
    // Core dialogue types
    DialogueLine,
    Scenario,
    PlaybackPhase,
    PlaybackStatus,
    RecognitionResult,

    // CEFR levels
    CEFRLevel,
    Difficulty,

    // API request/response
    GenerateRequest,

    // Auth types
    User,
    AuthResponse,
    RegisterRequest,
    LoginRequest,

    // Progress & Favorites
    ProgressRecord,
    FavoriteRecord,
    CourseRecord,
    LessonRecord,

    // Pronunciation & Progress
    PronunciationAttemptData,
    LessonReportData,
    ProfileStats,
    UserGoalData,

    // API response wrappers
    ApiError,
    ApiSuccess,
    PaginatedResponse,
} from '@shadowdrive/shared';
