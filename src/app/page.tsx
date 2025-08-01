"use client";

import { useEffect, useState } from "react";
import LessonForm from "@/components/lesson-form/index";
import ScheduleList from "@/components/schedule-list/index";
import { Lesson } from "@/types/types";
import styles from "./page.module.css";

export default function HomePage() {
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(
    undefined,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const data = localStorage.getItem("lessons");
    if (!data) {
      setLoading(false);
      return;
    }

    const all: Lesson[] = JSON.parse(data);
    setAllLessons(all);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureOnly = all.filter((lesson) => {
      const d = new Date(lesson.date);
      return d >= today;
    });

    setFilteredLessons(futureOnly);
    setLoading(false);
  }, []);

  const updateAndFilter = (updatedLessons: Lesson[]) => {
    setAllLessons(updatedLessons);
    localStorage.setItem("lessons", JSON.stringify(updatedLessons));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureOnly = updatedLessons.filter((l) => new Date(l.date) >= today);
    setFilteredLessons(futureOnly);
  };

  const handleAddLesson = (lesson: Lesson) => {
    if (selectedLesson) {
      // Edit mode: update existing lesson
      const updated = allLessons.map((l) => (l.id === lesson.id ? lesson : l));
      updateAndFilter(updated);
      setSelectedLesson(undefined);
    } else {
      // Add mode: add new lesson
      const updated = [...allLessons, lesson];
      updateAndFilter(updated);
    }
  };

  const handleDeleteLesson = (id: string) => {
    const updated = allLessons.filter((l) => l.id !== id);
    updateAndFilter(updated);
  };

  // Example: pass setSelectedLesson to ScheduleList so it can trigger edit
  // You need to implement the edit button in ScheduleList to call this
  return (
    <main className={styles.pageWrapper}>
      <h1
        style={{
          fontSize: "28px",
          marginBottom: "1rem",
          color: "#ffff",
          textAlign: "center",
        }}
      >
        Plan časova vožnje
      </h1>
      <LessonForm
        onAdd={handleAddLesson}
        existingLessons={filteredLessons}
        lessonToEdit={selectedLesson}
      />
      <ScheduleList
        lessons={filteredLessons}
        onDelete={handleDeleteLesson}
        loading={loading}
        onEdit={setSelectedLesson} // Add this prop to ScheduleList
      />
    </main>
  );
}
