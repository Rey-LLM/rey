# 🔌 API ПРИМЕРЫ

Все запросы к `http://localhost:5000/api`

## 🔐 АУТЕНТИФИКАЦИЯ

### Регистрация
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

ОТВЕТ:
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "username": "john",
    "email": "john@example.com"
  }
}
```

### Вход
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

ОТВЕТ:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

---

## 📁 ПРОЕКТЫ

### Получить все проекты
```bash
GET /api/projects
Authorization: Bearer {token}
```

### Создать проект
```bash
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Мой проект",
  "description": "Описание проекта",
  "category": "development",
  "priority": "high"
}
```

### Получить проект по ID
```bash
GET /api/projects/{projectId}
Authorization: Bearer {token}
```

### Обновить проект
```bash
PUT /api/projects/{projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Новое имя",
  "status": "active",
  "priority": "medium"
}
```

### Удалить проект
```bash
DELETE /api/projects/{projectId}
Authorization: Bearer {token}
```

---

## ✅ ЗАДАЧИ

### Создать задачу
```bash
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Новая задача",
  "description": "Описание",
  "project": "{projectId}",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-02-01T00:00:00Z"
}
```

### Получить задачи проекта
```bash
GET /api/tasks/project/{projectId}
Authorization: Bearer {token}
```

### Обновить статус задачи
```bash
PATCH /api/tasks/{taskId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in-progress"
}
```

### Добавить комментарий к задаче
```bash
POST /api/tasks/{taskId}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Комментарий"
}
```

---

## 👤 ПОЛЬЗОВАТЕЛИ

### Получить текущего пользователя
```bash
GET /api/users/me
Authorization: Bearer {token}
```

### Обновить профиль
```bash
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "Биография"
}
```

### Получить профиль пользователя
```bash
GET /api/users/{userId}
Authorization: Bearer {token}
```

---

## 🔌 WEBSOCKET СОБЫТИЯ

Подключись к WebSocket на `http://localhost:5000`

```javascript
const socket = io('http://localhost:5000');

// Присоединиться к проекту
socket.emit('join-project', projectId);

// Получить событие обновления задачи
socket.on('task-updated', (data) => {
  console.log('Задача обновлена:', data);
});

// Отправить обновление задачи
socket.emit('task-updated', {
  projectId: projectId,
  taskId: taskId,
  status: 'done'
});

// Покинуть проект
socket.emit('leave-project', projectId);
```

---

## 🧪 ПРИМЕРЫ CURL

### Тестируй с curl:

```bash
# Регистрация
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com",
    "password": "password123"
  }'

# Вход
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Получить проекты (замени TOKEN на реальный)
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN"

# Создать проект
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Новый проект",
    "description": "Тестовый проект"
  }'
```

---

## 📝 СТАТУСЫ ЗАДАЧ

- `todo` - К выполнению
- `in-progress` - В процессе
- `review` - На проверке
- `done` - Завершено
- `blocked` - Заблокировано

## 🎯 ПРИОРИТЕТЫ

- `low` - Низкий
- `medium` - Средний (по умолчанию)
- `high` - Высокий
- `critical` - Критичный

## 📊 СТАТУСЫ ПРОЕКТОВ

- `planning` - Планирование
- `active` - Активный (по умолчанию)
- `paused` - Приостановлен
- `completed` - Завершен
- `archived` - Архивирован
