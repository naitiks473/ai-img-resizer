import React, { useState, useEffect } from 'react';
import { ToolType } from './types';
import { Header } from './components/Header';
import { ToolGrid } from './components/ToolGrid';
import { Editor } from './components/Editor';
import { Analyzer } from './components/Analyzer';
import { TTS } from './components/TTS';
import { ChatBot } from './components/ChatBot';

const App: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.HOME);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const renderContent = () => {
    switch (currentTool) {
      case ToolType.HOME:
        return <ToolGrid onNavigate={setCurrentTool} />;
      case ToolType.RESIZE:
      case ToolType.CROP:
      case ToolType.COMPRESS:
      case ToolType.ROTATE:
      case ToolType.CONVERT:
      case ToolType.MEME:
      case ToolType.PICKER:
        return <Editor initialTool={currentTool} />;
      case ToolType.ANALYZE:
        return <Analyzer />;
      case ToolType.TTS:
        return <TTS />;
      default:
        return <ToolGrid onNavigate={setCurrentTool} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header 
        currentTool={currentTool} 
        onNavigate={setCurrentTool} 
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-grow">
        {renderContent()}
      </main>

      <ChatBot />
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-auto transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 dark:text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} IMG_Resizer.AI. All rights reserved. Powered by Google Gemini.
          </div>
      </footer>
    </div>
  );
};

export default App;