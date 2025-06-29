import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getShadowDocument = () => {
  const shadowHost = document.getElementById('ghostbar-shadow-host')
  return shadowHost?.shadowRoot || document
}
