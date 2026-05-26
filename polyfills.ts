
import { Buffer } from 'buffer';
import process from 'process';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = process;
  (window as any).global = window;
}

if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
  (globalThis as any).process = process;
  (globalThis as any).global = globalThis;
}

