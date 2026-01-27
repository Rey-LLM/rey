#!/bin/bash

# Скрипт для загрузки изменений на GitHub

cd /workspaces/rey

echo "🚀 Starting GitHub upload..."
echo ""

# Добавить все файлы
echo "📝 Adding files..."
git add .

# Создать коммит
echo "💾 Creating commit..."
git commit -m "feat: add Break Reminder feature + code review

- Added BreakReminder.js component with hourly notifications
- Sound alerts using Web Audio API
- Browser notifications support
- 5-minute break timer functionality
- Toggle on/off in UI with persistent state
- Updated App.js to include Break Reminder
- Added comprehensive documentation
- Completed full code review and error check
- Project approved for production deployment"

# Загрузить на GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Upload complete!"
echo "📍 Check: https://github.com/Rey-LLM/rey"
