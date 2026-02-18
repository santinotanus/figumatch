/**
 * Store global de ofertas.
 * En una app real esto viviría en un backend.
 * Usamos un módulo singleton para compartir estado entre páginas.
 */

import { OfertaCompleta, EstadoOferta } from "@/types";

// ─── Mock data — ofertas iniciales ────────────────────────────────────────────
let _ofertas: OfertaCompleta[] = [
    // Alguien me hizo una oferta (pendiente_yo = yo tengo que decidir)
    {
        id: "o1",
        usuarioId: "u1",
        usuarioNombre: "Matías Rodríguez",
        usuarioAvatar: "MR",
        usuarioCiudad: "Córdoba",
        figuritasQueRecibo: ["ARG-2", "ARG-3"],
        figuritasQueEntrego: ["ARG-1", "BRA-1"],
        estado: "pendiente_yo",
        fecha: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    },
    {
        id: "o2",
        usuarioId: "u4",
        usuarioNombre: "Sofía Martínez",
        usuarioAvatar: "SM",
        usuarioCiudad: "La Plata",
        figuritasQueRecibo: ["BRA-3"],
        figuritasQueEntrego: ["POR-1"],
        estado: "pendiente_yo",
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
    },
    // Yo mandé una oferta (pendiente_ellos = ellos tienen que decidir)
    {
        id: "o3",
        usuarioId: "u2",
        usuarioNombre: "Valentina López",
        usuarioAvatar: "VL",
        usuarioCiudad: "Rosario",
        figuritasQueRecibo: ["BRA-3", "ESP-2"],
        figuritasQueEntrego: ["GER-1", "URU-1"],
        estado: "pendiente_ellos",
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h ago
    },
    {
        id: "o4",
        usuarioId: "u5",
        usuarioNombre: "Tomás Herrera",
        usuarioAvatar: "TH",
        usuarioCiudad: "Mar del Plata",
        figuritasQueRecibo: ["GER-2"],
        figuritasQueEntrego: ["BRA-1"],
        estado: "pendiente_ellos",
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    // Ofertas activas (ya aceptadas)
    {
        id: "o5",
        usuarioId: "u3",
        usuarioNombre: "Lucas Fernández",
        usuarioAvatar: "LF",
        usuarioCiudad: "Mendoza",
        figuritasQueRecibo: ["ENG-2"],
        figuritasQueEntrego: ["FRA-1"],
        estado: "activa",
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
    {
        id: "o6",
        usuarioId: "u7",
        usuarioNombre: "Agustín Pérez",
        usuarioAvatar: "AP",
        usuarioCiudad: "Salta",
        figuritasQueRecibo: ["ESP-LOGO"],
        figuritasQueEntrego: ["ESP-1"],
        estado: "activa",
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    },
];

// ─── Store API ────────────────────────────────────────────────────────────────
export function getOfertas(): OfertaCompleta[] {
    return [..._ofertas];
}

export function getOfertaById(id: string): OfertaCompleta | undefined {
    return _ofertas.find(o => o.id === id);
}

export function aceptarOferta(id: string): void {
    _ofertas = _ofertas.map(o =>
        o.id === id ? { ...o, estado: "activa" as EstadoOferta } : o
    );
}

export function rechazarOferta(id: string): void {
    _ofertas = _ofertas.map(o =>
        o.id === id ? { ...o, estado: "rechazada" as EstadoOferta } : o
    );
}

export function cancelarOferta(id: string): void {
    _ofertas = _ofertas.map(o =>
        o.id === id ? { ...o, estado: "cancelada" as EstadoOferta } : o
    );
}

export function addOferta(oferta: Omit<OfertaCompleta, "id" | "fecha">): OfertaCompleta {
    const nueva: OfertaCompleta = {
        ...oferta,
        id: `o${Date.now()}`,
        fecha: new Date().toISOString(),
    };
    _ofertas = [nueva, ..._ofertas];
    return nueva;
}
