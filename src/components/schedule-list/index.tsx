"use client";

import { Lesson } from "@/types/types";
import styles from "./index.module.scss";

type Props = {
  lessons: Lesson[];
  onDelete: (id: string) => void;
  loading?: boolean;
};

export default function ScheduleList({ lessons, onDelete, loading }: Props) {
  if (loading) return null;

  const grouped = lessons.reduce<Record<string, Lesson[]>>((acc, lesson) => {
    if (!acc[lesson.date]) acc[lesson.date] = [];
    acc[lesson.date].push(lesson);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();
  const formattedDate = (lesson: Lesson) =>
    new Date(lesson.date).toLocaleDateString("sr-RS");

  return (
    <div>
      {sortedDates.map((date) => (
        <div key={date} className={styles.dateGroup}>
          <h2>{new Date(date).toLocaleDateString("sr-RS")}</h2>
          <ul>
            {grouped[date]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((lesson) => (
                <li key={lesson.id} className={styles.lessonItem}>
                  {lesson.startTime} – {lesson.endTime}{" "}
                  <strong>{lesson.student}</strong>
                  <button
                    onClick={() => {
                      const message = `Da li ste sigurni da želite da izbrišete termin za ${lesson.student} (${formattedDate(lesson)}, ${lesson.startTime} – ${lesson.endTime})?`;
                      const confirmed = window.confirm(message);
                      if (confirmed) {
                        onDelete(lesson.id);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
