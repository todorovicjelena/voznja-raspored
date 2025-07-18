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
    const updated = [...allLessons, lesson];
    updateAndFilter(updated);
  };

  const handleDeleteLesson = (id: string) => {
    const updated = allLessons.filter((l) => l.id !== id);
    updateAndFilter(updated);
  };

  return (
    <main className={styles.pageWrapper}>
      <h1 style={{ fontSize: "28px", marginBottom: "1rem" }}>
        📋 Plan časova vožnje
      </h1>
      <LessonForm onAdd={handleAddLesson} existingLessons={filteredLessons} />
      <ScheduleList
        lessons={filteredLessons}
        onDelete={handleDeleteLesson}
        loading={loading}
      />
      <a href="/arhiva" style={{ fontSize: "20px" }}>
        📂 Arhiva
      </a>
    </main>
  );
}
