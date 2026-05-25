# e-qagaz — Система электронного архива студентов колледжа 🎓

Универсальная production-ready система управления студентами, их успеваемостью и файловым архивом. Проект состоит из разделенного Frontend (Next.js 15) и Backend (NestJS + Prisma).

## Ролевая Модель (RBAC)
- **STUDENT (Студент)**: Имеет доступ к своему профилю, загрузке достижений, просмотру оценок и файлов.
- **HEAD_DEPARTMENT (Заведующий)**: Имеет доступ к дашборду отделения, видит студентов своего отделения, может одобрять/отклонять загруженные достижения.
- **ADMIN (Администратор)**: Полный контроль. Управление предметами, оценками, пользователями, логами и аналитикой.

## Стек Технологий
- **Frontend**: React 19, Next.js 15 (App Router), Zustand (State), Tailwind CSS, Framer Motion, Shadcn UI.
- **Backend**: NestJS, Prisma ORM, PostgreSQL, Passport/JWT, Bcrypt, Multer (для файлов).
- **Инфраструктура**: Docker, docker-compose, Nginx (Reverse Proxy + Rate Limiting).

---

## 🚀 Быстрый старт (Production / Docker)

Убедитесь, что у вас установлен Docker и docker-compose.

1. **Склонируйте репозиторий и настройте окружение**:
   Скопируйте `backend/.env.example` в `backend/.env` (или создайте `.env` в корне для docker-compose).

   *Пример `.env`:*
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=secret
   POSTGRES_DB=eqagaz
   JWT_SECRET=production_super_secret_key_change_me
   ```

2. **Запустите проект**:
   ```bash
   docker-compose up -d --build
   ```

3. **Синхронизация БД**:
   При первом запуске вам нужно накатить схему БД:
   ```bash
   docker exec -it eqagaz_backend npx prisma db push
   ```

4. Доступ:
   - Приложение будет доступно по адресу `http://localhost`.
   - Nginx сам разруливает `/api` запросы на бэкенд и `/uploads` статику.

---

## 💻 Локальная разработка

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```
API запустится на `http://localhost:4000`. Swagger-документация: `http://localhost:4000/api/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Фронтенд запустится на `http://localhost:3000`.

---

## 📄 API Документация
Все REST API эндпоинты задокументированы через Swagger.
Запустите Backend и перейдите на `/api/docs` для тестирования и просмотра всех DTO.

## Оптимизации Production (v1.0)
- **Frontend**: Внедрен компонент `next/image` для WebP компрессии аватарок и файлов.
- **Backend**: Настроен модуль `@nestjs/throttler` (Rate Limiting) для защиты Auth-роутов от брутфорса.
- **DB**: Созданы B-Tree индексы в PostgreSQL (через Prisma `@@index`) для оптимизации фильтрации студентов и поиска логов.
