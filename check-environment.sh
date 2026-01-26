#!/bin/bash

# 🔍 ПРОВЕРКА ОКРУЖЕНИЯ

echo "🔍 Проверка окружения для Rey Project..."
echo ""

# Проверка Node.js
echo "1️⃣ Node.js:"
if command -v node &> /dev/null; then
    echo "   ✅ Установлен: $(node --version)"
else
    echo "   ❌ НЕ установлен. Установи: https://nodejs.org"
fi

# Проверка npm
echo ""
echo "2️⃣ npm:"
if command -v npm &> /dev/null; then
    echo "   ✅ Установлен: $(npm --version)"
else
    echo "   ❌ НЕ установлен"
fi

# Проверка MongoDB
echo ""
echo "3️⃣ MongoDB:"
if command -v mongod &> /dev/null; then
    echo "   ✅ Установлен"
    mongod --version | head -1
else
    echo "   ⚠️  НЕ установлен. Установи: sudo apt-get install mongodb"
fi

# Проверка .env файла
echo ""
echo "4️⃣ Файл .env:"
if [ -f ".env" ]; then
    echo "   ✅ Найден"
    echo "   Содержимое:"
    cat .env | sed 's/^/     /'
else
    echo "   ❌ НЕ найден"
    echo "   Создай .env файл с:"
    echo "     MONGODB_URI=mongodb://localhost:27017/project-manager"
    echo "     JWT_SECRET=your-secret-key"
    echo "     PORT=5000"
    echo "     CLIENT_URL=http://localhost:3000"
fi

# Проверка node_modules
echo ""
echo "5️⃣ node_modules (Backend):"
if [ -d "node_modules" ]; then
    echo "   ✅ Найдены"
else
    echo "   ❌ НЕ найдены"
    echo "   Запусти: npm install"
fi

# Проверка client node_modules
echo ""
echo "6️⃣ node_modules (Frontend):"
if [ -d "client/node_modules" ]; then
    echo "   ✅ Найдены"
else
    echo "   ❌ НЕ найдены"
    echo "   Запусти: cd client && npm install"
fi

# Проверка портов
echo ""
echo "7️⃣ Портов:"
if ! lsof -i :5000 &> /dev/null; then
    echo "   ✅ Порт 5000 свободен"
else
    echo "   ⚠️  Порт 5000 занят"
fi

if ! lsof -i :3000 &> /dev/null; then
    echo "   ✅ Порт 3000 свободен"
else
    echo "   ⚠️  Порт 3000 занят"
fi

if ! lsof -i :27017 &> /dev/null; then
    echo "   ⚠️  Порт 27017 (MongoDB) не запущен"
else
    echo "   ✅ MongoDB запущена на порту 27017"
fi

echo ""
echo "════════════════════════════════════════"
echo "📋 РЕЗЮМЕ:"
echo ""
echo "✅ Если всё зелёное → готово к запуску!"
echo ""
echo "Команды для запуска:"
echo "  mongod                           # Терминал 1"
echo "  cd /workspaces/rey && npm run dev # Терминал 2"
echo "  cd /workspaces/rey/client && npm start # Терминал 3"
echo ""
echo "════════════════════════════════════════"
