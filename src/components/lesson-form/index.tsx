"use client";

import { useState, useEffect } from "react";
import { Lesson } from "@/types/types";
import { v4 as uuidv4 } from "uuid";
import styles from "./index.module.scss";

type LessonFormProps = {
  onAdd: (lesson: Lesson) => void;
  existingLessons: Lesson[] | null;
};

export default function LessonForm({
  onAdd,
  existingLessons,
}: LessonFormProps) {
  const [date, setDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [student, setStudent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) {
      setError("");
      return;
    }

    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      setError("⛔ Ovaj datum je u prošlosti – koristi arhivu.");
    } else {
      setError("");
    }
  }, [date]);

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

    setError("");
  };

  const checkConflict = (start: string, end: string) => {
    if (!date || !start || !end) return false;

    return existingLessons?.some((l) => {
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
      id: uuidv4(),
      date,
      startTime,
      endTime,
      student,
    });

    // Reset form
    setDate("");
    setStartTime("");
    setEndTime("");
    setStudent("");
    setError("");
  };

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <label>
        📅 Datum:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <fieldset disabled={!!error}>
        <label>
          <div className={styles.timeGroup}>
            <label>
              ⏰ Početak:
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              >
                <option value="">Izaberi</option>
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time} disabled={isTimeTaken(time)}>
                    {time}
                  </option>
                ))}
              </select>
            </label>{" "}
            <label>
              ⏰ Kraj:
              <select
                value={endTime}
                onChange={(e) => handleTimeChange("end", e.target.value)}
                required
                disabled={!startTime}
              >
                <option value="">Izaberi</option>
                {getEndTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>{" "}
          </div>
        </label>

        <label>
          👤 Učenik:
          <input
            type="text"
            placeholder="Ime i prezime"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={!!error}>
          ✅ Dodaj čas
        </button>
      </fieldset>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
