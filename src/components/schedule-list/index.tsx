"use client";

import { Lesson } from "@/types/types";
import { Pencil, Trash2 } from "lucide-react";
import styles from "./index.module.scss";

type Props = {
  lessons: Lesson[];
  onDelete: (id: string) => void;
  onEdit?: (lesson: Lesson) => void;
  loading?: boolean;
};

export default function ScheduleList({
  lessons,
  onDelete,
  onEdit,
  loading,
}: Props) {
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
                  <div className={styles.time}>
                    {lesson.startTime} – {lesson.endTime}
                  </div>
                  <div className={styles.student}>{lesson.student}</div>
                  <button
                    onClick={() => {
                      const message = `Da li ste sigurni da želite da izbrišete termin za ${lesson.student} (${formattedDate(lesson)}, ${lesson.startTime} – ${lesson.endTime})?`;
                      const confirmed = window.confirm(message);
                      if (confirmed) {
                        onDelete(lesson.id);
                      }
                    }}
                    title="Obriši"
                  >
                    <Trash2 color="#2d52ec" size={15} />
                  </button>
                  {onEdit && (
                    <button onClick={() => onEdit(lesson)} title="Izmeni">
                      <Pencil color="#2d52ec" size={15} />
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
