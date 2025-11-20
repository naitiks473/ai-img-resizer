import React from 'react';
import { ToolType } from '../types';
import { Image, Crop, Minimize2, ScanEye, Mic, RotateCw, FileType, Type, Palette } from 'lucide-react';

interface ToolGridProps {
  onNavigate: (tool: ToolType) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onNavigate }) => {
  const tools = [
    { 
      type: ToolType.RESIZE, 
      title: 'Resize Image', 
      desc: 'Resize images to exact pixels or percentage.',
      icon: <Image className="w-8 h-8 text-blue-500" /> 
    },
    { 
      type: ToolType.CROP, 
      title: 'Crop Image', 
      desc: 'Crop parts of an image for social media.',
      icon: <Crop className="w-8 h-8 text-green-500" /> 
    },
    { 
      type: ToolType.COMPRESS, 
      title: 'Compress Image', 
      desc: 'Reduce file size without losing quality.',
      icon: <Minimize2 className="w-8 h-8 text-orange-500" /> 
    },
    { 
      type: ToolType.CONVERT, 
      title: 'Image Converter', 
      desc: 'Convert between JPG, PNG, WEBP and PDF.',
      icon: <FileType className="w-8 h-8 text-red-500" /> 
    },
    { 
      type: ToolType.ROTATE, 
      title: 'Rotate & Flip', 
      desc: 'Rotate images 90° or flip them.',
      icon: <RotateCw className="w-8 h-8 text-indigo-500" /> 
    },
    { 
      type: ToolType.MEME, 
      title: 'Meme Generator', 
      desc: 'Add text captions to your images.',
      icon: <Type className="w-8 h-8 text-yellow-500" /> 
    },
    { 
      type: ToolType.PICKER, 
      title: 'Color Picker', 
      desc: 'Pick colors directly from your image.',
      icon: <Palette className="w-8 h-8 text-pink-500" /> 
    },
    { 
      type: ToolType.ANALYZE, 
      title: 'AI Image Analysis', 
      desc: 'Understand image content with Gemini 3 Pro.',
      icon: <ScanEye className="w-8 h-8 text-purple-600" />,
      badge: 'AI'
    },
    { 
      type: ToolType.TTS, 
      title: 'Text to Speech', 
      desc: 'Generate human-like speech from text.',
      icon: <Mic className="w-8 h-8 text-pink-600" />,
      badge: 'AI'
    },
  ];

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">All the tools you need</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Edit, convert, and enhance your images in one place.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, idx) => (
            <div 
              key={idx}
              onClick={() => onNavigate(tool.type)}
              className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-gray-600 transition-colors">
                  {tool.icon}
                </div>
                {tool.badge && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    {tool.badge}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{tool.title}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};