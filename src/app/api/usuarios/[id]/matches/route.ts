import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UsuarioModel } from "@/lib/models";

/**
 * GET /api/usuarios/[id]/matches
 * Devuelve los usuarios que tienen figuritas que yo necesito
 * y que necesitan figuritas que yo tengo de más.
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    const { id } = await params;

    const yo = await UsuarioModel.findById(id).lean();
    if (!yo) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    // Buscar usuarios que tengan al menos 1 figurita que me falta
    const candidatos = await UsuarioModel.find({
        _id: { $ne: yo._id },
        repetidas: { $in: yo.faltantes },
    })
        .select("-password -googleId")
        .lean();

    const matches = candidatos
        .map((u) => {
            const figuritasEnComun = u.repetidas.filter((id: string) =>
                yo.faltantes.includes(id)
            );
            const figuritasParaOfrecer = yo.repetidas.filter((id: string) =>
                u.faltantes.includes(id)
            );
            return { usuario: u, figuritasEnComun, figuritasParaOfrecer };
        })
        .filter((m) => m.figuritasEnComun.length > 0);

    return NextResponse.json(matches);
}
