import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { Upload, Loader2, Search, Sparkles, ScanEye } from 'lucide-react';

export const Analyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prompt, setPrompt] = useState("Describe this image in detail.");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(''); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setResult('');
    try {
        // Extract MIME type
        const mimeType = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/png';
        const text = await analyzeImage(image, mimeType, prompt);
        setResult(text || 'No description generated.');
    } catch (error) {
        console.error(error);
        setResult('Error analyzing image. Please try again.');
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI Image Analysis</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Powered by Gemini 3 Pro Preview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              image 
                ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500' 
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {!image ? (
              <>
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                  <Upload className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Click to upload or drag and drop</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            ) : (
              <div className="relative">
                 <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                 <button 
                    onClick={() => setImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                 >
                    <Upload className="w-4 h-4 rotate-45" /> {/* Close icon lookalike */}
                 </button>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt</label>
                <textarea 
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none text-sm bg-white dark:bg-gray-700 dark:text-white"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            <button
                onClick={handleAnalyze}
                disabled={!image || isAnalyzing}
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
            >
                {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Image'}</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full min-h-[400px] transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-gray-400" />
            Analysis Result
          </h3>
          <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 overflow-y-auto">
            {result ? (
                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</p>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <ScanEye className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Upload an image and click analyze to see results here.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};