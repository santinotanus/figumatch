import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UsuarioModel } from "@/lib/models";

// GET /api/feed?usuarioId=<mongoId>
export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuarioId");

    if (!usuarioId) return NextResponse.json({ error: "usuarioId requerido" }, { status: 400 });

    const yoDoc = await UsuarioModel.findById(usuarioId);
    if (!yoDoc) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    const yo = yoDoc.toObject();

    // En MongoDB las figuritas están guardadas como strings ("10", "24", etc.)
    // Filtramos solo las numéricas (descartamos "FIG-34", "FRA-ESC", etc.)
    const misFaltantesStr: string[] = (yo.faltantes ?? []).filter((f: string) => !isNaN(Number(f)));
    const misRepetidasStr: string[] = (yo.repetidas ?? []).filter((r: string) => !isNaN(Number(r)));
    const misFaltantesNum: number[] = misFaltantesStr.map(Number);
    const misRepetidasNum: number[] = misRepetidasStr.map(Number);
    const misZonas: string[] = yo.zonas ?? [];

    if (misFaltantesStr.length === 0) return NextResponse.json([]);

    const zonaQuery = misZonas.length > 0
        ? { $elemMatch: { $in: misZonas } }
        : { $exists: true, $not: { $size: 0 } };

    // Buscar por strings (como están guardadas en BD)
    const candidatos = await UsuarioModel.find({
        _id: { $ne: yo._id },
        zonas: zonaQuery,
        repetidas: { $elemMatch: { $in: misFaltantesStr } },
    })
        .select("nombre ciudad avatar foto premium zonas repetidas faltantes reputacion cambiosHechos")
        .lean();

    const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

    const matches = candidatos
        .map(u => {
            const susRepetidasNum: number[] = (u.repetidas ?? []).filter((r: string) => !isNaN(Number(r))).map(Number);
            const susFaltantesNum: number[] = (u.faltantes ?? []).filter((f: string) => !isNaN(Number(f))).map(Number);
            const susZonas: string[] = u.zonas ?? [];

            const zonasEnComun = misZonas.filter(z => susZonas.some(sz => norm(sz) === norm(z)));
            if (misZonas.length > 0 && zonasEnComun.length === 0) return null;

            const figuritasQueNecesito = [...new Set(susRepetidasNum.filter(n => misFaltantesNum.includes(n)))];
            const figuritasQueLeOfrezco = [...new Set(misRepetidasNum.filter(n => susFaltantesNum.includes(n)))];

            if (figuritasQueNecesito.length === 0 || figuritasQueLeOfrezco.length === 0) return null;

            return {
                usuario: {
                    id: String(u._id),
                    nombre: u.nombre,
                    ciudad: u.ciudad ?? "",
                    avatar: u.avatar ?? String(u.nombre ?? "??").slice(0, 2).toUpperCase(),
                    foto: u.foto ?? "",
                    premium: u.premium ?? false,
                    zonas: susZonas,
                    zonasEnComun,
                    reputacion: u.reputacion ?? 0,
                    cambiosHechos: u.cambiosHechos ?? 0,
                },
                figuritasQueNecesito,
                figuritasQueLeOfrezco,
            };
        })
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .sort((a, b) => {
            if (a.usuario.premium && !b.usuario.premium) return -1;
            if (!a.usuario.premium && b.usuario.premium) return 1;
            return b.figuritasQueNecesito.length - a.figuritasQueNecesito.length;
        });

    return NextResponse.json(matches);
}
