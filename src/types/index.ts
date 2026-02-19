export interface Figurita {
    id: string;
    numero: number;
    nombre: string;
    pais: string;
    tipo: "jugador" | "escudo" | "estadio" | "especial";
}

export interface Usuario {
    id: string;
    nombre: string;
    ciudad: string;
    avatar: string;
    foto?: string;         // URL de foto de perfil (opcional)
    repetidas: string[]; // IDs de figuritas repetidas
    faltantes: string[]; // IDs de figuritas faltantes
    zonas?: string[];    // Hasta 3 zonas de encuentro
    reputacion?: number; // 1.0 – 5.0
    cambiosHechos?: number;
}

export interface Match {
    usuario: Usuario;
    figuritasEnComun: Figurita[]; // Sus repetidas que yo necesito
    figuritasParaOfrecer: Figurita[]; // Mis repetidas que él necesita
}

export interface Oferta {
    usuarioDestinoId: string;
    figuritasQueQuiero: string[]; // IDs que quiero de él
    figuritasQueOfrezco: string[]; // IDs que le ofrezco
}

export type EstadoOferta = "pendiente_yo" | "pendiente_ellos" | "activa" | "rechazada" | "cancelada";

export interface Encuentro {
    lugar: string;
    fecha: string;       // "2026-02-20"
    hora: string;        // "17:30"
    propuestoPor: "yo" | "ellos";
    aceptado: boolean;
}

export interface OfertaCompleta {
    id: string;
    usuarioId: string;         // El otro usuario
    usuarioNombre: string;
    usuarioAvatar: string;
    usuarioCiudad: string;
    figuritasQueRecibo: string[];  // IDs que YO recibo
    figuritasQueEntrego: string[]; // IDs que YO entrego
    estado: EstadoOferta;
    fecha: string;             // ISO date string
    encuentro?: Encuentro;     // Datos del encuentro físico
}

// Configuración de precio especial para una figurita repetida
export interface FiguriteEspecial {
    id: string;       // ID de la figurita
    precio: number;   // Cuántas normales vale (ej: 5 = vale 5 figuritas normales)
}
