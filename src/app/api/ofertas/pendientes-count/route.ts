import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { OfertaModel, UsuarioModel } from "@/lib/models";

// GET /api/ofertas/pendientes-count?usuarioId=xxx
// Devuelve cuántas ofertas requieren acción del usuario logueado
export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuarioId");
    if (!usuarioId) return NextResponse.json({ count: 0 });

    // Verificar que el usuario existe
    const usuario = await UsuarioModel.findById(usuarioId).select("_id").lean();
    if (!usuario) return NextResponse.json({ count: 0 });

    // Ofertas que requieren acción del usuario:
    // 1. Ofertas recibidas (destinatario soy yo) en estado "pendiente" → tengo que aceptar o rechazar
    // 2. Ofertas activas donde yo aún no confirmé el intercambio como realizado
    const [pendientesRecibidas, activasSinConfirmar] = await Promise.all([
        OfertaModel.countDocuments({
            destinatarioId: usuarioId,
            estado: "pendiente",
        }),
        OfertaModel.countDocuments({
            $or: [
                { remitenteId: usuarioId, estado: "activa", confirmadoPorRemitente: { $ne: true } },
                { destinatarioId: usuarioId, estado: "activa", confirmadoPorDestinatario: { $ne: true } },
            ],
        }),
    ]);

    return NextResponse.json({ count: pendientesRecibidas + activasSinConfirmar });
}
