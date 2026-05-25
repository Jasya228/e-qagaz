import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

const DEFAULT_DB = {
  users: [
    {
      id: "admin-id",
      email: "admin@aspc.kz",
      passwordHash: "password123",
      firstName: "Админ",
      lastName: "Супер",
      role: "ADMIN",
      isActive: true,
      patronymic: "",
      phone: "",
      dateOfBirth: "",
      gender: "MALE"
    },
    {
      id: "head-id",
      email: "head@aspc.kz",
      passwordHash: "password123",
      firstName: "Молдир",
      lastName: "Бекежановна",
      role: "HEAD_DEPARTMENT",
      isActive: true,
      patronymic: "",
      phone: "",
      dateOfBirth: "",
      gender: "FEMALE"
    },
    {
      id: "student-id",
      email: "asanovsayat@aspc.kz",
      passwordHash: "password123",
      firstName: "Саят",
      lastName: "Асанов",
      role: "STUDENT",
      isActive: true,
      patronymic: "Жаксилик Оглы ",
      phone: "8 707 705 1106",
      dateOfBirth: "2005-11-06",
      gender: "MALE"
    }
  ],
  students: [
    {
      id: "student-profile-id",
      userId: "student-id",
      departmentId: "departments-1779729047400",
      studentIdNumber: "STU12345",
      courseYear: 4,
      groupName: "ИС22-4Б",
      birthDate: "2005-04-12",
      nationality: "Казах",
      birthPlace: "Узбекистан, г. Ташкент",
      actualAddress: "Г. Алматы, Ауэзовский район, мкр. Достык, Аймусин 13",
      familyStatus": "Полная (2)",
      phoneNumber: "+7 (777) 123-45-67",
      hobbies: "Футбол, мобилография ",
      curatorName": "Сейсекулова Сауле"
    }
  ],
  departments: [
    {
      id: "departments-1779729047400",
      name: "Информационная система",
      headUserId: "head-id"
    }
  ],
  groups: [
    {
      id: "groups-1779729282046",
      name: "ИС22-4Б"
    }
  ],
  curators: [
    {
      id: "curators-1779729184184",
      name: "Сейсекулова Сауле"
    }
  ],
  subjects: [],
  grades: [],
  achievements: [],
  files: [],
  logs: [],
  notifications: [],
  documents: [],
  lessons: [],
  totalScores: []
};

export async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      // Write seed DB
      await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to seed DB:', e);
    }
    return DEFAULT_DB;
  }
}

export async function writeDB(data: any) {
  // Use formatting for readability during debug
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
