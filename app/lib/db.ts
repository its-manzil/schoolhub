"use client";
import { getJSON, setJSON } from "../lib/storage";
import { CollectionKey, CollectionMap } from "./types";

const DB_KEY = "schoolhub-db";

function init(): CollectionMap {
  const empty: CollectionMap = {
    users: [],
    students: [],
    teachers: [],
    classes: [],
    subjects: [],
    attendance: [],
    exams: [],
    marks: [],
    fees: [],
    library: [],
    hostel: [],
    inventory: [],
    notices: [],
  };
  return getJSON<CollectionMap>(DB_KEY, empty);
}

function persist(db: CollectionMap) {
  setJSON(DB_KEY, db);
}

export function list<K extends CollectionKey>(key: K): CollectionMap[K] {
  const db = init();
  return db[key];
}

type ItemOf<K extends CollectionKey> = CollectionMap[K] extends Array<infer U> ? U : never;
type IdItem<K extends CollectionKey> = ItemOf<K> & { id: string };

export function add<K extends CollectionKey>(key: K, item: Partial<IdItem<K>>): IdItem<K> {
  const db = init();
  // naive id
  const withId: IdItem<K> = {
    id: (item.id as string) ?? crypto.randomUUID?.() ?? String(Date.now()),
    ...(item as object),
  } as IdItem<K>;
  (db[key] as unknown as IdItem<K>[]).push(withId);
  persist(db);
  return withId;
}

export function update<K extends CollectionKey>(key: K, id: string, patch: Partial<IdItem<K>>): IdItem<K> | null {
  const db = init();
  const arr = db[key] as unknown as IdItem<K>[];
  const idx = arr.findIndex((x) => x.id === id);
  if (idx >= 0) {
    arr[idx] = { ...(arr[idx] as object), ...(patch as object) } as IdItem<K>;
    persist(db);
    return arr[idx];
  }
  return null;
}

export function remove<K extends CollectionKey>(key: K, id: string) {
  const db = init();
  const arr = db[key] as unknown as IdItem<K>[];
  const next = arr.filter((x) => x.id !== id);
  (db as CollectionMap)[key] = next as unknown as CollectionMap[K];
  persist(db);
}

export function seedIfEmpty() {
  const db = init();
  if (db.students.length === 0) {
    db.students = [
      { id: "s1", name: "Aarav Sharma", classId: "c1", guardian: "R. Sharma" },
      { id: "s2", name: "Priya Gupta", classId: "c1", guardian: "S. Gupta" },
    ];
  }
  if (db.teachers.length === 0) {
    db.teachers = [
      { id: "t1", name: "Mr. Verma", subjects: ["Math", "Physics"] },
      { id: "t2", name: "Ms. Iyer", subjects: ["English"] },
    ];
  }
  if (db.classes.length === 0) {
    db.classes = [
      { id: "c1", name: "Grade 10 - A", teacherId: "t1", subjectIds: ["Math", "Science", "English"] },
    ];
  }
  persist(db);
}
