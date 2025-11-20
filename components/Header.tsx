import React from 'react';
import { ToolType } from '../types';
import { Image, Crop, Minimize2, ScanEye, Home, Type, FileType, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  currentTool: ToolType;
  onNavigate: (tool: ToolType) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTool, onNavigate, isDark, toggleTheme }) => {
  const navItems = [
    { type: ToolType.RESIZE, label: 'Resize', icon: <Image className="w-4 h-4" /> },
    { type: ToolType.CROP, label: 'Crop', icon: <Crop className="w-4 h-4" /> },
    { type: ToolType.COMPRESS, label: 'Compress', icon: <Minimize2 className="w-4 h-4" /> },
    { type: ToolType.CONVERT, label: 'Convert', icon: <FileType className="w-4 h-4" /> },
    { type: ToolType.ANALYZE, label: 'AI Analyze', icon: <ScanEye className="w-4 h-4 text-purple-600 dark:text-purple-400" /> },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate(ToolType.HOME)}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
              <Image className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              IMG_Resizer<span className="text-blue-600 dark:text-blue-400">.AI</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <nav className="hidden lg:flex space-x-1 mr-2">
              {navItems.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onNavigate(item.type)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${currentTool === item.type 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
               <button
                  onClick={() => onNavigate(ToolType.MEME)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${currentTool === ToolType.MEME 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <Type className="w-4 h-4" />
                  <span>Meme</span>
                </button>
            </nav>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="lg:hidden">
              <button onClick={() => onNavigate(ToolType.HOME)} className="p-2">
                <Home className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};