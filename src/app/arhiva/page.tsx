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

  return (
    <main>
      <button onClick={() => window.history.back()} className={styles.button}>
        🔙 Nazad
      </button>
      <h1 style={{ fontSize: "26px", marginBottom: "1rem" }}>
        🕘 Arhiva – Prethodna nedelja
      </h1>
      <ScheduleList lessons={archivedLessons} onDelete={() => {}} />
    </main>
  );
}
