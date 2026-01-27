#!/bin/bash

# 🧪 Тестирование функции "Все документы"
# Скрипт для проверки всех новых API endpoints

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
API_URL="http://localhost:5000/api"
TOKEN="" # Заполните вашим JWT токеном после входа

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 Тестирование API документов${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Функция для вывода результата
test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  local data=$4

  echo -e "${YELLOW}📍 Тест: $description${NC}"
  echo "Endpoint: $method $endpoint"

  if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ ОШИБКА: TOKEN не установлен${NC}"
    echo "Пожалуйста, установите TOKEN после входа в систему"
    return 1
  fi

  if [ "$method" = "GET" ]; then
    response=$(curl -s -X GET "$API_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -X POST "$API_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  echo "Response:"
  echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
  echo -e "${GREEN}✅ Тест завершен\n${NC}"
}

echo -e "${BLUE}1️⃣  ПОЛУЧИТЬ ВСЕ ДОКУМЕНТЫ${NC}"
echo "Команда для тестирования:"
echo "curl -X GET '$API_URL/documents' \\"
echo "  -H 'Authorization: Bearer \$TOKEN'"
echo ""
echo -e "${YELLOW}Параметры запроса:${NC}"
echo "  - sortBy: 'date' | 'name' | 'priority' (default: 'date')"
echo "  - order: 'asc' | 'desc' (default: 'desc')"
echo "  - search: 'текст для поиска'"
echo "  - category: 'development' | 'design' | 'marketing' и т.д."
echo ""

echo -e "${BLUE}2️⃣  ПРИМЕРЫ ЗАПРОСОВ${NC}\n"

echo -e "${YELLOW}Пример 1: Получить все документы${NC}"
echo "curl -X GET '$API_URL/documents' \\"
echo "  -H 'Authorization: Bearer \$TOKEN'"
echo ""

echo -e "${YELLOW}Пример 2: Получить документы, отсортированные по названию${NC}"
echo "curl -X GET '$API_URL/documents?sortBy=name&order=asc' \\"
echo "  -H 'Authorization: Bearer \$TOKEN'"
echo ""

echo -e "${YELLOW}Пример 3: Поиск документов со словом 'API'${NC}"
echo "curl -X GET '$API_URL/documents?search=API' \\"
echo "  -H 'Authorization: Bearer \$TOKEN'"
echo ""

echo -e "${YELLOW}Пример 4: Получить только документы категории 'development'${NC}"
echo "curl -X GET '$API_URL/documents?category=development' \\"
echo "  -H 'Authorization: Bearer \$TOKEN'"
echo ""

echo -e "${YELLOW}Пример 5: Комбинированный запрос${NC}"
echo "curl -X GET '$API_URL/documents?sortBy=priority&order=asc&search=urgent&category=development' \\"
echo "  -H 'Authorization: Bearer \$TOKEN'"
echo ""

echo -e "${BLUE}3️⃣  ПОЛУЧИТЬ ДОКУМЕНТЫ КОНКРЕТНОГО ПРОЕКТА${NC}"
echo "curl -X GET '$API_URL/documents/project/PROJECT_ID' \\"
echo "  -H 'Authorization: Bearer \$TOKEN'"
echo ""

echo -e "${BLUE}4️⃣  ПОЛУЧИТЬ СПИСОК КАТЕГОРИЙ${NC}"
echo "curl -X GET '$API_URL/documents/categories/list' \\"
echo "  -H 'Authorization: Bearer \$TOKEN'"
echo ""

echo -e "${BLUE}5️⃣  ОЖИДАЕМЫЕ ОТВЕТЫ${NC}\n"

echo -e "${YELLOW}Для /documents:${NC}"
cat << 'EOF'
{
  "message": "Documents retrieved successfully",
  "documents": [
    {
      "_id": "...",
      "title": "Название задачи",
      "description": "Описание",
      "type": "task",
      "projectId": "...",
      "projectName": "Название проекта",
      "category": "development",
      "priority": "high",
      "status": "in-progress",
      "creator": {...},
      "assignee": {...},
      "createdAt": "2026-01-27T10:00:00Z",
      "dueDate": "2026-02-01T18:00:00Z",
      "tags": ["urgent", "api"],
      "folder": "development"
    }
  ],
  "folders": {
    "development": [...],
    "design": [...],
    "marketing": [...]
  },
  "stats": {
    "total": 42,
    "byCategory": {
      "development": 20,
      "design": 15,
      "marketing": 7
    },
    "byType": {
      "tasks": 40,
      "attachments": 2
    },
    "byStatus": {
      "todo": 10,
      "in-progress": 15,
      "review": 8,
      "done": 8,
      "blocked": 1
    }
  },
  "totalFolders": 3
}
EOF
echo ""

echo -e "${YELLOW}Для /documents/categories/list:${NC}"
cat << 'EOF'
{
  "message": "Categories retrieved successfully",
  "categories": ["development", "design", "marketing", "sales", "support", "Вложения"],
  "total": 6
}
EOF
echo ""

echo -e "${BLUE}6️⃣  КОДЫ ОШИБОК И РЕШЕНИЯ${NC}\n"

echo -e "${RED}401 Unauthorized${NC}"
echo "→ Решение: Убедитесь, что вы авторизованы и TOKEN правильно установлен"
echo ""

echo -e "${RED}403 Access Denied${NC}"
echo "→ Решение: У вас нет доступа к этому проекту или документу"
echo ""

echo -e "${RED}404 Not Found${NC}"
echo "→ Решение: Документ или проект не найден"
echo ""

echo -e "${RED}500 Internal Server Error${NC}"
echo "→ Решение: Проверьте логи сервера, может быть проблема с БД"
echo ""

echo -e "${BLUE}7️⃣  ИНСТРУКЦИИ ДЛЯ РУЧНОГО ТЕСТИРОВАНИЯ${NC}\n"

echo -e "${YELLOW}Шаг 1: Получите JWT токен${NC}"
echo "1. Откройте приложение"
echo "2. Введите учетные данные для входа"
echo "3. Откройте DevTools (F12)"
echo "4. Перейдите на вкладку 'Application'"
echo "5. В localStorage найдите 'token' и скопируйте значение"
echo ""

echo -e "${YELLOW}Шаг 2: Используйте Postman или curl${NC}"
echo "1. Создайте новый GET запрос"
echo "2. URL: $API_URL/documents"
echo "3. В Headers добавьте: Authorization: Bearer <ВАШ_TOKEN>"
echo "4. Отправьте запрос"
echo ""

echo -e "${YELLOW}Шаг 3: Проверьте результаты${NC}"
echo "1. Убедитесь, что вернулся JSON с documents и folders"
echo "2. Проверьте, что все документы сгруппированы по папкам"
echo "3. Убедитесь, что есть статистика (stats)"
echo ""

echo -e "${BLUE}8️⃣  ТЕСТОВЫЕ СЦЕНАРИИ${NC}\n"

echo -e "${YELLOW}Сценарий 1: Поиск срочных документов${NC}"
echo "1. Откройте страницу Documents"
echo "2. В поле сортировки выберите 'Сортировка по приоритету'"
echo "3. Убедитесь, что порядок 'Убывание'"
echo "4. Все срочные задачи должны быть в начале"
echo ""

echo -e "${YELLOW}Сценарий 2: Группировка по категориям${NC}"
echo "1. Откройте страницу Documents"
echo "2. Проверьте, что есть разные папки (development, design и т.д.)"
echo "3. Нажмите на папку для развертывания"
echo "4. Убедитесь, что документы из этой папки отображаются"
echo ""

echo -e "${YELLOW}Сценарий 3: Поиск документов${NC}"
echo "1. Введите слово в поле поиска (например 'API')"
echo "2. Убедитесь, что остались только документы с этим словом"
echo "3. Попробуйте другие поисковые запросы"
echo ""

echo -e "${YELLOW}Сценарий 4: Сортировка${NC}"
echo "1. Попробуйте разные способы сортировки"
echo "2. Для каждого выберите 'Возрастание' и 'Убывание'"
echo "3. Проверьте, что порядок документов изменяется"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Инструкции завершены${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Чтобы начать тестирование:${NC}"
echo "1. Установите TOKEN переменную в начале скрипта"
echo "2. Запустите этот скрипт: bash test-documents-api.sh"
echo "3. Проверьте все endpoints"
echo ""
