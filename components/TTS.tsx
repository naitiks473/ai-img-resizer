import React, { useState, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import { Mic, Play, Volume2, Loader2, StopCircle, User } from 'lucide-react';

export const TTS: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const voices = [
    { name: 'Puck', gender: 'Male', description: 'Deep & Steady' },
    { name: 'Charon', gender: 'Male', description: 'Confident & Clear' },
    { name: 'Kore', gender: 'Female', description: 'Calm & Soothing' },
    { name: 'Fenrir', gender: 'Male', description: 'Energetic & Strong' },
    { name: 'Zephyr', gender: 'Female', description: 'Friendly & Warm' },
  ];

  // Helper to decode base64 string into a Uint8Array
  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Helper to decode audio data into an AudioBuffer
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
      // We need to manually create buffer from PCM data
      const dataInt16 = new Int16Array(data.buffer);
      const numChannels = 1;
      const sampleRate = 24000;
      
      const frameCount = dataInt16.length / numChannels;
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
      
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
      }
      return buffer;
  };

  const handleGenerateAndPlay = async () => {
    if (!text.trim()) return;
    
    stopAudio(); // Stop any current playback
    setIsLoading(true);

    try {
      const base64Audio = await generateSpeech(text, voice);
      if (!base64Audio) throw new Error("No audio data returned");

      // Initialize AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if(ctx.state === 'suspended') await ctx.resume();

      // Decode
      const bytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(bytes, ctx);

      // Play
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      
      sourceRef.current = source;
      source.start();
      setIsPlaying(true);

    } catch (error) {
      console.error("TTS Error", error);
      alert("Failed to generate speech. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI Text to Speech</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Generate lifelike speech with Gemini 2.5 Flash TTS Preview</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-pink-100 dark:border-pink-900/30 transition-colors">
        <div className="p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Mic className="w-6 h-6" />
             <span className="font-medium text-lg">Voice Generator</span>
           </div>
           <div className="text-xs bg-white/20 px-2 py-1 rounded flex items-center">
             <Volume2 className="w-3 h-3 mr-1" />
             {voice}
           </div>
        </div>

        <div className="p-8">
          {/* Voice Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Voice Model</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {voices.map((v) => (
                <button
                  key={v.name}
                  onClick={() => setVoice(v.name)}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-full ${
                    voice === v.name 
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 ring-1 ring-pink-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-pink-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <User className={`w-4 h-4 ${voice === v.name ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{v.gender}</span>
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${voice === v.name ? 'text-pink-900 dark:text-pink-300' : 'text-gray-900 dark:text-gray-100'}`}>{v.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{v.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="w-full p-4 text-lg border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none resize-none bg-gray-50 dark:bg-gray-700 dark:text-white mb-6"
            rows={6}
            placeholder="Type something here to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex items-center justify-end gap-4">
            {isPlaying && (
              <button
                onClick={stopAudio}
                className="flex items-center px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                Stop
              </button>
            )}
            <button
              onClick={handleGenerateAndPlay}
              disabled={!text || isLoading}
              className="flex items-center px-8 py-3 rounded-full bg-pink-600 text-white font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-200/50 transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Volume2 className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Generating...' : 'Generate & Play'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};