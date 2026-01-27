import React, { useState, useEffect } from 'react';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';

function BreakReminder() {
  const [isEnabled, setIsEnabled] = useState(() => {
    // Загрузить состояние из localStorage
    return JSON.parse(localStorage.getItem('breakReminderEnabled')) || false;
  });
  
  const [showNotification, setShowNotification] = useState(false);
  const [lastReminderTime, setLastReminderTime] = useState(new Date());

  // Сохранять состояние в localStorage
  useEffect(() => {
    localStorage.setItem('breakReminderEnabled', JSON.stringify(isEnabled));
  }, [isEnabled]);

  // Напоминание каждый час
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      setShowNotification(true);
      setLastReminderTime(new Date());

      // Проиграть звук уведомления
      playNotificationSound();

      // Показать браузерное уведомление если есть права
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Time for a break! ☕', {
          body: 'You have been working for an hour. Take a break and rest your eyes!',
          icon: '🎯',
          tag: 'break-reminder',
          requireInteraction: true
        });
      }

      // Скрыть уведомление через 10 секунд
      setTimeout(() => {
        setShowNotification(false);
      }, 10000);
    }, 3600000); // 1 час = 3600000 миллисекунд

    return () => clearInterval(interval);
  }, [isEnabled]);

  // Запросить разрешение на браузерные уведомления
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // Проиграть звук
  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Переключить напоминание
  const toggleReminder = () => {
    if (!isEnabled) {
      requestNotificationPermission();
    }
    setIsEnabled(!isEnabled);
  };

  // Закрыть уведомление
  const dismissNotification = () => {
    setShowNotification(false);
  };

  // Быстрый отдых (5 минут)
  const takeQuickBreak = () => {
    alert('Great! Take 5 minutes to rest. Your browser will remind you when time is up.');
    setTimeout(() => {
      alert('5 minutes are up! Ready to get back to work? 💪');
    }, 5 * 60 * 1000); // 5 минут
    dismissNotification();
  };

  return (
    <>
      {/* Toggle Button в навигации */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 999
        }}
      >
        <button
          onClick={toggleReminder}
          title={isEnabled ? 'Break reminder ON' : 'Break reminder OFF'}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isEnabled ? '#4CAF50' : '#cccccc',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            hover: {
              transform: 'scale(1.1)'
            }
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          <FiBell size={24} />
        </button>

        {/* Статус */}
        <div
          style={{
            marginTop: '0.5rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: isEnabled ? '#4CAF50' : '#999',
            fontWeight: 'bold'
          }}
        >
          {isEnabled ? '✓ ON' : '✗ OFF'}
        </div>
      </div>

      {/* Уведомление об отдыхе */}
      {showNotification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            zIndex: 10000,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
                ☕ Time for a Break!
              </h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', opacity: 0.9 }}>
                You've been working for 1 hour. Take a 5-10 minute break to rest your eyes and recharge.
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={takeQuickBreak}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FiCheck size={16} /> Take Break
                </button>
                <button
                  onClick={dismissNotification}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.8 }}>
                Last reminder: {lastReminderTime.toLocaleTimeString()}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(400px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}

      {/* Инструкция если впервые */}
      {isEnabled && !showNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: '5rem',
            right: '2rem',
            background: '#f0f0f0',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#333',
            maxWidth: '200px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 998
          }}
        >
          💡 <strong>Tip:</strong> You'll get a reminder every hour to take a break!
        </div>
      )}
    </>
  );
}

export default BreakReminder;
