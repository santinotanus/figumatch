import { Figurita, Usuario } from "@/types";

// Catálogo completo de figuritas del Mundial
export const TODAS_LAS_FIGURITAS: Figurita[] = [
    // Grupo A - Argentina
    { id: "ARG-1", numero: 1, nombre: "Lionel Messi", pais: "Argentina", tipo: "jugador" },
    { id: "ARG-2", numero: 2, nombre: "Julián Álvarez", pais: "Argentina", tipo: "jugador" },
    { id: "ARG-3", numero: 3, nombre: "Rodrigo De Paul", pais: "Argentina", tipo: "jugador" },
    { id: "ARG-4", numero: 4, nombre: "Enzo Fernández", pais: "Argentina", tipo: "jugador" },
    { id: "ARG-5", numero: 5, nombre: "Emiliano Martínez", pais: "Argentina", tipo: "jugador" },
    { id: "ARG-ESC", numero: 6, nombre: "Escudo Argentina", pais: "Argentina", tipo: "escudo" },
    // Brasil
    { id: "BRA-1", numero: 10, nombre: "Vinicius Jr.", pais: "Brasil", tipo: "jugador" },
    { id: "BRA-2", numero: 11, nombre: "Rodrygo", pais: "Brasil", tipo: "jugador" },
    { id: "BRA-3", numero: 12, nombre: "Casemiro", pais: "Brasil", tipo: "jugador" },
    { id: "BRA-4", numero: 13, nombre: "Alisson", pais: "Brasil", tipo: "jugador" },
    { id: "BRA-ESC", numero: 14, nombre: "Escudo Brasil", pais: "Brasil", tipo: "escudo" },
    // Francia
    { id: "FRA-1", numero: 20, nombre: "Kylian Mbappé", pais: "Francia", tipo: "jugador" },
    { id: "FRA-2", numero: 21, nombre: "Antoine Griezmann", pais: "Francia", tipo: "jugador" },
    { id: "FRA-3", numero: 22, nombre: "Aurélien Tchouaméni", pais: "Francia", tipo: "jugador" },
    { id: "FRA-ESC", numero: 23, nombre: "Escudo Francia", pais: "Francia", tipo: "escudo" },
    // España
    { id: "ESP-1", numero: 30, nombre: "Pedri", pais: "España", tipo: "jugador" },
    { id: "ESP-2", numero: 31, nombre: "Gavi", pais: "España", tipo: "jugador" },
    { id: "ESP-3", numero: 32, nombre: "Lamine Yamal", pais: "España", tipo: "jugador" },
    { id: "ESP-ESC", numero: 33, nombre: "Escudo España", pais: "España", tipo: "escudo" },
    // Alemania
    { id: "GER-1", numero: 40, nombre: "Florian Wirtz", pais: "Alemania", tipo: "jugador" },
    { id: "GER-2", numero: 41, nombre: "Jamal Musiala", pais: "Alemania", tipo: "jugador" },
    { id: "GER-ESC", numero: 42, nombre: "Escudo Alemania", pais: "Alemania", tipo: "escudo" },
    // Portugal
    { id: "POR-1", numero: 50, nombre: "Cristiano Ronaldo", pais: "Portugal", tipo: "jugador" },
    { id: "POR-2", numero: 51, nombre: "Bruno Fernandes", pais: "Portugal", tipo: "jugador" },
    { id: "POR-ESC", numero: 52, nombre: "Escudo Portugal", pais: "Portugal", tipo: "escudo" },
    // Especiales
    { id: "ESP-TROFEO", numero: 100, nombre: "Trofeo Copa del Mundo", pais: "FIFA", tipo: "especial" },
    { id: "ESP-LOGO", numero: 101, nombre: "Logo Mundial 2026", pais: "FIFA", tipo: "especial" },
    { id: "ESP-MASCOTA", numero: 102, nombre: "Mascota Oficial", pais: "FIFA", tipo: "especial" },
    // Uruguay
    { id: "URU-1", numero: 60, nombre: "Darwin Núñez", pais: "Uruguay", tipo: "jugador" },
    { id: "URU-2", numero: 61, nombre: "Federico Valverde", pais: "Uruguay", tipo: "jugador" },
    { id: "URU-ESC", numero: 62, nombre: "Escudo Uruguay", pais: "Uruguay", tipo: "escudo" },
    // Inglaterra
    { id: "ENG-1", numero: 70, nombre: "Jude Bellingham", pais: "Inglaterra", tipo: "jugador" },
    { id: "ENG-2", numero: 71, nombre: "Harry Kane", pais: "Inglaterra", tipo: "jugador" },
    { id: "ENG-ESC", numero: 72, nombre: "Escudo Inglaterra", pais: "Inglaterra", tipo: "escudo" },
];

// Mapa para acceso rápido por ID
export const FIGURITAS_MAP: Record<string, Figurita> = Object.fromEntries(
    TODAS_LAS_FIGURITAS.map((f) => [f.id, f])
);

// Usuario actual (YO)
export const MI_USUARIO: Usuario = {
    id: "me",
    nombre: "Nico García",
    ciudad: "Buenos Aires",
    avatar: "NG",
    repetidas: ["ARG-1", "ARG-1", "BRA-1", "FRA-1", "ESP-1", "GER-1", "POR-1", "URU-1", "ESP-TROFEO"],
    faltantes: ["ARG-2", "ARG-3", "BRA-2", "BRA-3", "FRA-2", "ESP-2", "ESP-3", "GER-2", "ENG-1", "ENG-2", "URU-2", "ESP-LOGO", "ESP-MASCOTA"],
    zonas: ["Olivos", "Vicente López"],
    reputacion: 4.7,
    cambiosHechos: 12,
};

// Otros usuarios
export const USUARIOS: Usuario[] = [
    {
        id: "u1",
        nombre: "Matías Rodríguez",
        ciudad: "Córdoba",
        avatar: "MR",
        premium: true,
        repetidas: ["ARG-2", "ARG-3", "BRA-2", "FRA-ESC", "GER-ESC", "ESP-TROFEO"],
        faltantes: ["ARG-1", "BRA-1", "FRA-1", "POR-1", "URU-1"],
        reputacion: 4.8,
        cambiosHechos: 23,
        zonas: ["Nueva Córdoba", "Palermo"],
    },
    {
        id: "u2",
        nombre: "Valentina López",
        ciudad: "Rosario",
        avatar: "VL",
        repetidas: ["BRA-3", "ESP-2", "ESP-3", "ENG-1", "URU-2", "ESP-LOGO"],
        faltantes: ["ARG-1", "ARG-2", "FRA-1", "GER-1", "POR-1"],
        reputacion: 4.2,
        cambiosHechos: 8,
        zonas: ["Rosario Centro"],
    },
    {
        id: "u3",
        nombre: "Lucas Fernández",
        ciudad: "Mendoza",
        avatar: "LF",
        repetidas: ["GER-2", "ENG-2", "ESP-MASCOTA", "ARG-ESC", "BRA-ESC"],
        faltantes: ["ARG-1", "BRA-1", "FRA-1", "ESP-1", "URU-1"],
        reputacion: 3.9,
        cambiosHechos: 5,
        zonas: ["Mendoza Centro", "Godoy Cruz"],
    },
    {
        id: "u4",
        nombre: "Sofía Martínez",
        ciudad: "La Plata",
        avatar: "SM",
        premium: true,
        repetidas: ["ARG-2", "FRA-2", "ENG-1", "URU-2", "ESP-LOGO", "ESP-MASCOTA"],
        faltantes: ["ARG-1", "BRA-1", "GER-1", "POR-1", "ESP-1"],
        reputacion: 5.0,
        cambiosHechos: 41,
        zonas: ["La Plata Centro", "Berisso"],
    },
    {
        id: "u5",
        nombre: "Tomás Herrera",
        ciudad: "Mar del Plata",
        avatar: "TH",
        repetidas: ["BRA-2", "BRA-3", "ESP-3", "GER-2", "POR-ESC"],
        faltantes: ["ARG-1", "ARG-2", "FRA-1", "ENG-1", "URU-1"],
        reputacion: 4.5,
        cambiosHechos: 17,
        zonas: ["Mar del Plata Centro"],
    },
    {
        id: "u6",
        nombre: "Camila Sosa",
        ciudad: "Tucumán",
        avatar: "CS",
        repetidas: ["ARG-3", "ESP-2", "ENG-2", "URU-2", "ESP-TROFEO"],
        faltantes: ["ARG-1", "BRA-1", "FRA-1", "GER-1", "POR-1"],
        reputacion: 4.1,
        cambiosHechos: 9,
        zonas: ["San Miguel de Tucumán"],
    },
    {
        id: "u7",
        nombre: "Agustín Pérez",
        ciudad: "Salta",
        avatar: "AP",
        repetidas: ["FRA-2", "GER-2", "ENG-1", "ESP-LOGO", "BRA-ESC"],
        faltantes: ["ARG-1", "ARG-2", "BRA-1", "ESP-1", "URU-1"],
        reputacion: 4.6,
        cambiosHechos: 14,
        zonas: ["Salta Centro", "Cerrillos"],
    },
    {
        id: "u8",
        nombre: "Florencia Díaz",
        ciudad: "Neuquén",
        avatar: "FD",
        repetidas: ["ARG-2", "ARG-3", "BRA-2", "ESP-2", "ENG-1", "ENG-2"],
        faltantes: ["ARG-1", "FRA-1", "GER-1", "POR-1", "URU-1"],
        reputacion: 3.7,
        cambiosHechos: 3,
        zonas: ["Neuquén Centro"],
    },
];

// Función para calcular la intersección entre mis faltantes y sus repetidas
export function calcularMatches(
    misFaltantes: string[],
    susRepetidas: string[]
): Figurita[] {
    const interseccion = susRepetidas.filter((id) => misFaltantes.includes(id));
    // Deduplicar
    const unicos = [...new Set(interseccion)];
    return unicos.map((id) => FIGURITAS_MAP[id]).filter(Boolean);
}

// Función para calcular qué puedo ofrecerle (mis repetidas que él necesita)
export function calcularOfertasPosibles(
    misRepetidas: string[],
    susFaltantes: string[]
): Figurita[] {
    const misRepetidasUnicas = [...new Set(misRepetidas)];
    const interseccion = misRepetidasUnicas.filter((id) => susFaltantes.includes(id));
    return interseccion.map((id) => FIGURITAS_MAP[id]).filter(Boolean);
}

// Obtener usuarios con al menos 1 match
export function getUsuariosConMatches() {
    return USUARIOS.map((usuario) => {
        const figuritasEnComun = calcularMatches(MI_USUARIO.faltantes, usuario.repetidas);
        const figuritasParaOfrecer = calcularOfertasPosibles(MI_USUARIO.repetidas, usuario.faltantes);
        return { usuario, figuritasEnComun, figuritasParaOfrecer };
    }).filter((m) => m.figuritasEnComun.length > 0);
}
