import { useState, useCallback } from "react";
import type { ApiCourse, ApiLesson, ActiveTab, ViewState, ResumeState } from "../_types";
import { Scenario } from "@/types/dialogue";

export function useNavigationState() {
    const [activeTab, setActiveTabHook] = useState<ActiveTab>("courses");
    const [viewState, setViewState] = useState<ViewState>("dashboard");

    const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<ApiLesson | null>(null);

    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [startFromIndex, setStartFromIndex] = useState(0);
    const [resumeState, setResumeState] = useState<ResumeState | null>(null);

    const setActiveTab = useCallback((tab: ActiveTab) => {
        setActiveTabHook(tab);
    }, []);

    const resetNavigationToDashboard = useCallback(() => {
        setScenario(null);
        setSelectedCourse(null);
        setSelectedLesson(null);
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setViewState("dashboard");
    }, []);

    const handleCategoryClick = useCallback((category: string, courses: ApiCourse[]) => {
        setSelectedCategory(category);
        const categoryCourses = courses.filter(c => c.category === category);
        const hasSubcategories = categoryCourses.some(c => c.subcategory !== null);
        setViewState(hasSubcategories ? "category" : "subcategory");
    }, []);

    const handleSubcategoryClick = useCallback((subcategory: string) => {
        setSelectedSubcategory(subcategory);
        setViewState("subcategory");
    }, []);

    const handleCourseClick = useCallback((courseId: string, courses: ApiCourse[]) => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            setSelectedCourse(course);
            setViewState("course-detail");
        }
    }, []);

    const handleBackFromCourseDetail = useCallback(() => {
        setScenario(null);
        setSelectedCourse(null);
        setViewState(selectedSubcategory || selectedCategory ? "subcategory" : "dashboard");
    }, [selectedCategory, selectedSubcategory]);

    const handleBackFromSubcategory = useCallback(
        (courses: ApiCourse[]) => {
            setSelectedSubcategory(null);
            if (selectedCategory) {
                const categoryCourses = courses.filter(c => c.category === selectedCategory);
                const hasSubcategories = categoryCourses.some(c => c.subcategory !== null);
                if (hasSubcategories) {
                    setViewState("category");
                } else {
                    setSelectedCategory(null);
                    setViewState("dashboard");
                }
            } else {
                setViewState("dashboard");
            }
        },
        [selectedCategory],
    );

    const handleBackFromCategory = useCallback(() => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setViewState("dashboard");
    }, []);

    return {
        activeTab,
        setActiveTab,
        viewState,
        setViewState,
        selectedCourse,
        setSelectedCourse,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        selectedLesson,
        setSelectedLesson,
        scenario,
        setScenario,
        startFromIndex,
        setStartFromIndex,
        resumeState,
        setResumeState,
        resetNavigationToDashboard,
        handleCategoryClick,
        handleSubcategoryClick,
        handleCourseClick,
        handleBackFromCourseDetail,
        handleBackFromSubcategory,
        handleBackFromCategory,
    };
}
