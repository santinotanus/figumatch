/**
 * Store global simple para las figuritas especiales del usuario.
 * En una app real esto viviría en un backend/contexto global.
 * Usamos un módulo singleton para compartir estado entre páginas.
 */

import { FiguriteEspecial } from "@/types";

// Estado en memoria (persiste mientras la app esté abierta)
let _especiales: Record<string, number> = {
    // Ejemplos pre-cargados para demo
    "ARG-1": 5,  // Messi vale 5
    "BRA-1": 3,  // Vinicius vale 3
    "POR-1": 3,  // Cristiano vale 3
};

export function getEspeciales(): Record<string, number> {
    return { ..._especiales };
}

export function setEspecial(id: string, precio: number) {
    _especiales = { ..._especiales, [id]: precio };
}

export function removeEspecial(id: string) {
    const { [id]: _, ...rest } = _especiales;
    _especiales = rest;
}

export function isEspecial(id: string): boolean {
    return id in _especiales;
}

export function getPrecio(id: string): number {
    return _especiales[id] ?? 1;
}
