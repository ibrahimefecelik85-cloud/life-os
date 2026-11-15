// Dersler modülünün veri işlemleri (ekle / güncelle / sil).
// Ekranlar veritabanına doğrudan değil, bu fonksiyonlar üzerinden erişir.
import { db } from "@/lib/db";
import { newId } from "@/lib/id";
import type { Assessment, ClassSession, Course, ID } from "@/types";

// ---- Dersler ----
export type CourseInput = Omit<Course, "id" | "createdAt">;

export const addCourse = (data: CourseInput) =>
  db.courses.add({ ...data, id: newId(), createdAt: Date.now() });

export const updateCourse = (id: ID, data: Partial<CourseInput>) => db.courses.update(id, data);

/** Dersi silerken ona bağlı program saatlerini ve teslimleri de siler */
export const deleteCourse = (id: ID) =>
  db.transaction("rw", db.courses, db.classSessions, db.assessments, async () => {
    await db.classSessions.where("courseId").equals(id).delete();
    await db.assessments.where("courseId").equals(id).delete();
    await db.courses.delete(id);
  });

// ---- Program saatleri ----
export type SessionInput = Omit<ClassSession, "id">;

export const addSession = (data: SessionInput) => db.classSessions.add({ ...data, id: newId() });
export const updateSession = (id: ID, data: Partial<SessionInput>) => db.classSessions.update(id, data);
export const deleteSession = (id: ID) => db.classSessions.delete(id);

// ---- Ödev / quiz / sınav ----
export type AssessmentInput = Omit<Assessment, "id" | "createdAt" | "done">;

export const addAssessment = (data: AssessmentInput) =>
  db.assessments.add({ ...data, id: newId(), done: false, createdAt: Date.now() });

export const updateAssessment = (id: ID, data: Partial<Assessment>) => db.assessments.update(id, data);
export const deleteAssessment = (id: ID) => db.assessments.delete(id);
export const toggleAssessment = (a: Assessment) => db.assessments.update(a.id, { done: !a.done });
