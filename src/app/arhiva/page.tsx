"use client";

import { useEffect, useState } from "react";
import { Lesson } from "@/types/types";
import ScheduleList from "@/components/schedule-list/index";
import styles from "./index.module.scss";

export default function ArchivePage() {
  const [archivedLessons, setArchivedLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("lessons");
    if (!data) return;

    const allLessons: Lesson[] = JSON.parse(data);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const filtered = allLessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return lessonDate < new Date() && lessonDate >= oneWeekAgo;
    });

    setArchivedLessons(filtered);
  }, []);

  const handleDeleteArchivedLesson = (id: string) => {
    setArchivedLessons((prev) => {
      const updated = prev.filter((lesson) => lesson.id !== id);

      // Učitajte sve lekcije koje imate u localStorage
      const allLessonsStr = localStorage.getItem("lessons");
      if (allLessonsStr) {
        const allLessons: Lesson[] = JSON.parse(allLessonsStr);
        // Uklonite obrisanu lekciju iz svih lekcija
        const updatedAll = allLessons.filter((lesson) => lesson.id !== id);
        // Sačuvajte nazad u localStorage
        localStorage.setItem("lessons", JSON.stringify(updatedAll));
      }

      return updated;
    });
  };

  return (
    <main>
      <button onClick={() => window.history.back()} className={styles.button}>
        🔙 Nazad
      </button>
      <h1 style={{ fontSize: "26px", marginBottom: "1rem" }}>
        🕘 Arhiva – Prethodna nedelja
      </h1>
      <ScheduleList
        lessons={archivedLessons}
        onDelete={handleDeleteArchivedLesson}
      />
    </main>
  );
}
