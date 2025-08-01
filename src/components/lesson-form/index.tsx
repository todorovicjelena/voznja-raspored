"use client";

import { useState, useEffect } from "react";
import { Lesson } from "@/types/types";
import { v4 as uuidv4 } from "uuid";
import { CalendarDays, Clock, User } from "lucide-react";
import styles from "./index.module.scss";

type LessonFormProps = {
  onAdd: (lesson: Lesson) => void;
  existingLessons: Lesson[] | null;
  lessonToEdit?: Lesson;
};

export default function LessonForm({
  onAdd,
  existingLessons,
  lessonToEdit,
}: LessonFormProps) {
  const [date, setDate] = useState(() =>
    lessonToEdit ? lessonToEdit.date : new Date().toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState(lessonToEdit?.startTime || "");
  const [endTime, setEndTime] = useState(lessonToEdit?.endTime || "");
  const [student, setStudent] = useState(lessonToEdit?.student || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setDate(
      lessonToEdit ? lessonToEdit.date : new Date().toISOString().split("T")[0],
    );
    setStartTime(lessonToEdit?.startTime || "");
    setEndTime(lessonToEdit?.endTime || "");
    setStudent(lessonToEdit?.student || "");
  }, [lessonToEdit]);

  function isPastDateTime(date: string, time: string): boolean {
    if (!date || !time) return false;
    const now = new Date();
    const selected = new Date(`${date}T${time}`);
    return selected < now;
  }

  const handleTimeChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartTime(value);
      const conflict = checkConflict(value, endTime);
      if (conflict) {
        setError("Ne može – to vreme se preklapa.");
      } else {
        setError("");
      }
    } else {
      setEndTime(value);
      const conflict = checkConflict(startTime, value);
      if (conflict) {
        setError("Ne može – to vreme se preklapa.");
      } else {
        setError("");
      }
    }
  };

  const checkConflict = (start: string, end: string) => {
    if (!date || !start || !end) return false;
    return existingLessons?.some((l) => {
      if (lessonToEdit && l.id === lessonToEdit.id) return false; // Ignore current lesson
      if (l.date !== date) return false;
      return (
        (start >= l.startTime && start < l.endTime) ||
        (end > l.startTime && end <= l.endTime) ||
        (start <= l.startTime && end >= l.endTime)
      );
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !student) return;
    if (isPastDateTime(date, startTime)) {
      setError("⛔ Ne možeš zakazati čas u prošlosti.");
      return;
    }
    onAdd({
      id: lessonToEdit ? lessonToEdit.id : uuidv4(),
      date,
      startTime,
      endTime,
      student,
    });
    // Reset form only if adding new
    if (!lessonToEdit) {
      setDate("");
      setStartTime("");
      setEndTime("");
      setStudent("");
      setError("");
    }
  };

  useEffect(() => {
    if (date && !isPastDateTime(date, startTime)) {
      setError("");
    }
  }, [date, startTime]);

  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let h = 8; h <= 20; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  };

  const isTimeTaken = (time: string) => {
    if (!date) return false;
    return existingLessons?.some((l) => {
      if (lessonToEdit && l.id === lessonToEdit.id) return false;
      if (l.date !== date) return false;
      return time >= l.startTime && time < l.endTime;
    });
  };

  const getEndTimeOptions = () => {
    if (!startTime) return [];
    return generateTimeOptions().filter((time) => {
      return time > startTime && !checkConflict(startTime, time);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.form} ${lessonToEdit ? styles.editMode : ""}`}
    >
      <label>
        <CalendarDays color="white" size={15} /> Datum:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <fieldset disabled={!!error}>
        <div className={styles.timeGroup}>
          <div>
            <label>
              <div>
                {" "}
                <Clock color="white" size={15} /> Početak:
              </div>
              <select
                value={startTime}
                onChange={(e) => handleTimeChange("start", e.target.value)}
                required
              >
                <option value="">Izaberi</option>
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time} disabled={isTimeTaken(time)}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              <div>
                {" "}
                <Clock color="white" size={15} /> Kraj:
              </div>
              <select
                value={endTime}
                onChange={(e) => handleTimeChange("end", e.target.value)}
                required
              >
                <option value="">Izaberi</option>
                {getEndTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <label>
          <User color="white" size={15} /> Učenik:
          <input
            type="text"
            placeholder="Ime i prezime"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={!!error}>
          {lessonToEdit ? "Sačuvaj izmene" : "+ Dodaj čas"}
        </button>
      </fieldset>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
