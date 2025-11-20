import React, { useState, useRef, useEffect } from 'react';
import { ToolType } from '../types';
import { Upload, Download, RotateCcw, ZoomIn, ZoomOut, Sliders, RotateCw, FlipHorizontal, FlipVertical, Type, Palette, Copy, FileType, Crop, Minimize2 } from 'lucide-react';

interface EditorProps {
  initialTool: ToolType;
}

export const Editor: React.FC<EditorProps> = ({ initialTool }) => {
  const [image, setImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool);
  
  // Tools State
  const [resizeParams, setResizeParams] = useState({ width: 0, height: 0, maintainAspectRatio: true });
  const [compressQuality, setCompressQuality] = useState(0.8);
  const [memeText, setMemeText] = useState({ top: '', bottom: '', color: '#ffffff', stroke: '#000000' });
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Handling file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
          setResizeParams({ width: img.width, height: img.height, maintainAspectRatio: true });
          imgRef.current = img;
          drawImageToCanvas(img);
        };
        img.src = ev.target?.result as string;
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImageToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // If meme tool is active, draw text
    if (activeTool === ToolType.MEME) {
       drawMemeText(ctx, img.width, img.height);
    }
  };

  const drawMemeText = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
     const fontSize = Math.floor(width / 10);
     ctx.font = `bold ${fontSize}px Impact, sans-serif`;
     ctx.textAlign = 'center';
     ctx.fillStyle = memeText.color;
     ctx.strokeStyle = memeText.stroke;
     ctx.lineWidth = fontSize / 15;
     
     // Top Text
     if (memeText.top) {
         ctx.textBaseline = 'top';
         ctx.strokeText(memeText.top.toUpperCase(), width / 2, 10);
         ctx.fillText(memeText.top.toUpperCase(), width / 2, 10);
     }

     // Bottom Text
     if (memeText.bottom) {
         ctx.textBaseline = 'bottom';
         ctx.strokeText(memeText.bottom.toUpperCase(), width / 2, height - 10);
         ctx.fillText(memeText.bottom.toUpperCase(), width / 2, height - 10);
     }
  };

  // Re-render canvas when meme text changes
  useEffect(() => {
      if (activeTool === ToolType.MEME && imgRef.current) {
          drawImageToCanvas(imgRef.current);
      }
  }, [memeText, activeTool]);


  // --- Rotate & Flip Logic ---
  const rotateImage = (degrees: number) => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (degrees === 90 || degrees === -90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
    } else {
        canvas.width = img.width;
        canvas.height = img.height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    updateImageRef(canvas.toDataURL());
  };

  const flipImage = (direction: 'horizontal' | 'vertical') => {
      const img = imgRef.current;
      if (!img) return;

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.translate(direction === 'horizontal' ? img.width : 0, direction === 'vertical' ? img.height : 0);
      ctx.scale(direction === 'horizontal' ? -1 : 1, direction === 'vertical' ? -1 : 1);
      ctx.drawImage(img, 0, 0);

      updateImageRef(canvas.toDataURL());
  };

  const updateImageRef = (dataUrl: string) => {
      const newImg = new Image();
      newImg.onload = () => {
          imgRef.current = newImg;
          setOriginalDimensions({ width: newImg.width, height: newImg.height });
          setResizeParams({ width: newImg.width, height: newImg.height, maintainAspectRatio: true });
          drawImageToCanvas(newImg);
      };
      newImg.src = dataUrl;
  };

  // --- Resize Logic ---
  const handleResizeChange = (e: React.ChangeEvent<HTMLInputElement>, dim: 'width' | 'height') => {
    const val = parseInt(e.target.value) || 0;
    setResizeParams(prev => {
      if (prev.maintainAspectRatio) {
        const ratio = originalDimensions.width / originalDimensions.height;
        return dim === 'width' 
          ? { ...prev, width: val, height: Math.round(val / ratio) }
          : { ...prev, height: val, width: Math.round(val * ratio) };
      }
      return { ...prev, [dim]: val };
    });
  };

  const applyResize = () => {
    const img = imgRef.current;
    if (!img) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = resizeParams.width;
    tempCanvas.height = resizeParams.height;
    const ctx = tempCanvas.getContext('2d');
    if(!ctx) return;
    
    ctx.drawImage(img, 0, 0, resizeParams.width, resizeParams.height);
    updateImageRef(tempCanvas.toDataURL());
  };

  // --- Crop Logic (Simple Center Crop) ---
  const applyCrop = (aspectRatio: number) => {
    const img = imgRef.current;
    if (!img) return;
    
    const currentW = img.width;
    const currentH = img.height;
    let newW = currentW;
    let newH = currentH;

    if (currentW / currentH > aspectRatio) {
        newW = currentH * aspectRatio;
    } else {
        newH = currentW / aspectRatio;
    }

    const startX = (currentW - newW) / 2;
    const startY = (currentH - newH) / 2;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newW;
    tempCanvas.height = newH;
    const ctx = tempCanvas.getContext('2d');
    if(!ctx) return;
    
    ctx.drawImage(img, startX, startY, newW, newH, 0, 0, newW, newH);
    updateImageRef(tempCanvas.toDataURL());
  };

  // --- Color Picker Logic ---
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (activeTool !== ToolType.PICKER) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = "#" + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + (pixel[2])).toString(16).slice(1);
      setPickedColor(hex);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    const ext = outputFormat.split('/')[1];
    link.download = `edited-image.${ext}`;
    link.href = canvas.toDataURL(outputFormat, compressQuality);
    link.click();
  };

  useEffect(() => {
      setActiveTool(initialTool);
  }, [initialTool]);

  if (!image) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
         <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-2xl p-16 text-center hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-6">
              <Upload className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Image to Edit</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Drop files here or click to upload</p>
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg">
                Select Image
            </button>
         </div>
      </div>
    );
  }

  // List of all available tools for the editor sidebar
  const editorTools = [
      ToolType.RESIZE, ToolType.CROP, ToolType.COMPRESS, ToolType.CONVERT, ToolType.ROTATE, ToolType.MEME, ToolType.PICKER
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar Tools */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto scrollbar-hide transition-colors duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Editor Tools</h2>
        </div>
        
        <div className="p-4">
            {/* Tool Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {editorTools.map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveTool(t)}
                        className={`flex items-center justify-center px-3 py-2 text-xs font-bold rounded-md border transition-all ${
                            activeTool === t 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                        title={t}
                    >
                        {t === ToolType.RESIZE && <Sliders className="w-4 h-4" />}
                        {t === ToolType.CROP && <Crop className="w-4 h-4" />}
                        {t === ToolType.COMPRESS && <Minimize2 className="w-4 h-4" />}
                        {t === ToolType.CONVERT && <FileType className="w-4 h-4" />}
                        {t === ToolType.ROTATE && <RotateCw className="w-4 h-4" />}
                        {t === ToolType.MEME && <Type className="w-4 h-4" />}
                        {t === ToolType.PICKER && <Palette className="w-4 h-4" />}
                    </button>
                ))}
            </div>

            {/* --- RESIZE --- */}
            {activeTool === ToolType.RESIZE && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-2">Resize Options</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Width (px)</label>
                            <input 
                                type="number" 
                                value={resizeParams.width}
                                onChange={(e) => handleResizeChange(e, 'width')}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Height (px)</label>
                            <input 
                                type="number" 
                                value={resizeParams.height}
                                onChange={(e) => handleResizeChange(e, 'height')}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={resizeParams.maintainAspectRatio}
                            onChange={(e) => setResizeParams(p => ({...p, maintainAspectRatio: e.target.checked}))}
                            className="rounded text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                        <span>Lock aspect ratio</span>
                    </label>
                    <button 
                        onClick={applyResize}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Apply Resize
                    </button>
                </div>
            )}

            {/* --- CROP --- */}
            {activeTool === ToolType.CROP && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-2">Crop Ratios</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 16/9, 4/3, 3/2, 2/3, 9/16].map(ratio => (
                            <button 
                                key={ratio}
                                onClick={() => applyCrop(ratio)}
                                className="border border-gray-200 dark:border-gray-600 rounded p-2 text-xs hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-200 text-gray-600 dark:text-gray-300"
                            >
                                {ratio === 1 ? 'Square' : ratio.toFixed(2)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* --- ROTATE --- */}
            {activeTool === ToolType.ROTATE && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-2">Rotate & Flip</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => rotateImage(90)} className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                             <RotateCw className="w-5 h-5 mb-1 text-gray-600 dark:text-gray-300"/>
                             <span className="text-xs text-gray-600 dark:text-gray-300">Rotate 90°</span>
                        </button>
                        <button onClick={() => rotateImage(-90)} className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                             <RotateCcw className="w-5 h-5 mb-1 text-gray-600 dark:text-gray-300"/>
                             <span className="text-xs text-gray-600 dark:text-gray-300">Rotate -90°</span>
                        </button>
                        <button onClick={() => flipImage('horizontal')} className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                             <FlipHorizontal className="w-5 h-5 mb-1 text-gray-600 dark:text-gray-300"/>
                             <span className="text-xs text-gray-600 dark:text-gray-300">Flip H</span>
                        </button>
                        <button onClick={() => flipImage('vertical')} className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                             <FlipVertical className="w-5 h-5 mb-1 text-gray-600 dark:text-gray-300"/>
                             <span className="text-xs text-gray-600 dark:text-gray-300">Flip V</span>
                        </button>
                    </div>
                </div>
            )}

            {/* --- MEME --- */}
            {activeTool === ToolType.MEME && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-2">Meme Text</h3>
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Top Text</label>
                        <input 
                            type="text" 
                            value={memeText.top} 
                            onChange={(e) => setMemeText(p => ({...p, top: e.target.value}))}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm outline-none focus:border-blue-500"
                            placeholder="TOP TEXT"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Bottom Text</label>
                        <input 
                            type="text" 
                            value={memeText.bottom} 
                            onChange={(e) => setMemeText(p => ({...p, bottom: e.target.value}))}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm outline-none focus:border-blue-500"
                            placeholder="BOTTOM TEXT"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Text Color</label>
                            <input type="color" value={memeText.color} onChange={e => setMemeText(p => ({...p, color: e.target.value}))} className="w-full h-8 cursor-pointer bg-transparent" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Stroke Color</label>
                            <input type="color" value={memeText.stroke} onChange={e => setMemeText(p => ({...p, stroke: e.target.value}))} className="w-full h-8 cursor-pointer bg-transparent" />
                        </div>
                    </div>
                </div>
            )}

            {/* --- COMPRESS --- */}
            {activeTool === ToolType.COMPRESS && (
                <div className="space-y-4 animate-fade-in">
                     <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-2">Compression</h3>
                     <input 
                        type="range" 
                        min="0.1" 
                        max="1" 
                        step="0.1"
                        value={compressQuality}
                        onChange={(e) => setCompressQuality(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Smaller Size</span>
                        <span>{Math.round(compressQuality * 100)}% Quality</span>
                        <span>Better Quality</span>
                     </div>
                </div>
            )}

            {/* --- CONVERT --- */}
            {(activeTool === ToolType.CONVERT || activeTool === ToolType.COMPRESS) && (
                 <div className="space-y-4 animate-fade-in mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Export Format</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {['image/jpeg', 'image/png', 'image/webp'].map((fmt) => (
                            <button
                                key={fmt}
                                onClick={() => setOutputFormat(fmt as any)}
                                className={`text-xs py-2 rounded border ${
                                    outputFormat === fmt 
                                    ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300 font-bold' 
                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                {fmt.split('/')[1].toUpperCase()}
                            </button>
                        ))}
                    </div>
                 </div>
            )}

            {/* --- PICKER --- */}
            {activeTool === ToolType.PICKER && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-2">Color Picker</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Click anywhere on the image to pick a color.</p>
                    {pickedColor ? (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                             <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 shadow-inner" style={{ backgroundColor: pickedColor }}></div>
                             <div className="flex-1">
                                 <div className="text-xs text-gray-500 dark:text-gray-400">HEX Code</div>
                                 <div className="font-mono font-bold text-gray-800 dark:text-gray-100">{pickedColor}</div>
                             </div>
                             <button onClick={() => navigator.clipboard.writeText(pickedColor)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800">
                                 <Copy className="w-4 h-4" />
                             </button>
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 text-gray-400 text-xs rounded">No color picked</div>
                    )}
                </div>
            )}

        </div>
        
        <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button 
                onClick={downloadImage}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition-all"
            >
                <Download className="w-5 h-5" />
                <span>Download Image</span>
            </button>
            <button 
                onClick={() => { setImage(null); imgRef.current = null; }}
                className="w-full mt-3 text-gray-500 dark:text-gray-400 text-sm hover:text-red-500"
            >
                Start Over
            </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto p-4 md:p-8 flex items-center justify-center relative transition-colors duration-200">
          {/* Background Grid Pattern for transparency */}
          <div className="shadow-2xl border-4 border-white dark:border-gray-700 bg-white line-pattern relative">
             <canvas 
                ref={canvasRef} 
                onClick={handleCanvasClick}
                className={`max-w-full max-h-[80vh] block ${activeTool === ToolType.PICKER ? 'cursor-crosshair' : ''}`} 
             />
          </div>
      </div>
    </div>
  );
};