declare module 'qrcode' {
  export interface QRCodeToStringOptions {
    type?: 'svg' | 'utf8';
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }

  export interface QRCodeToDataURLOptions {
    margin?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }

  export function toString(text: string, options?: QRCodeToStringOptions): Promise<string>;
  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeToDataURLOptions): Promise<void>;
}
