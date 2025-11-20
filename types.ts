export enum ToolType {
  HOME = 'HOME',
  RESIZE = 'RESIZE',
  CROP = 'CROP',
  COMPRESS = 'COMPRESS',
  ANALYZE = 'ANALYZE',
  TTS = 'TTS',
  ROTATE = 'ROTATE',
  CONVERT = 'CONVERT',
  MEME = 'MEME',
  PICKER = 'PICKER'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
}