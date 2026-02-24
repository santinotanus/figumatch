import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { OfertaModel } from "@/lib/models";

// GET /api/ofertas/historial?usuarioId=xxx → ofertas completadas/rechazadas/canceladas
export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuarioId");
    if (!usuarioId) return NextResponse.json({ error: "Falta usuarioId" }, { status: 400 });

    const ofertas = await OfertaModel.find({
        $or: [{ remitenteId: usuarioId }, { destinatarioId: usuarioId }],
        estado: "completada",
    })
        .populate("remitenteId", "-password -googleId")
        .populate("destinatarioId", "-password -googleId")
        .sort({ createdAt: -1 })
        .lean();

    const serializadas = ofertas.map(o => {
        const rem = o.remitenteId as Record<string, unknown>;
        const dest = o.destinatarioId as Record<string, unknown>;
        const yoSoyRemitente = String(rem._id) === usuarioId;
        const otro = yoSoyRemitente ? dest : rem;

        return {
            id: String(o._id),
            fecha: o.updatedAt,
            usuarioNombre: otro.nombre,
            usuarioFoto: otro.foto ?? "",
            usuarioAvatar: otro.avatar ?? String(otro.nombre).slice(0, 2).toUpperCase(),
            usuarioCiudad: otro.ciudad ?? "",
            figuritasRecibidas: yoSoyRemitente
                ? (o.figuritasDestino ?? []).map(Number)
                : (o.figuritasRemitente ?? []).map(Number),
            figuritasEntregadas: yoSoyRemitente
                ? (o.figuritasRemitente ?? []).map(Number)
                : (o.figuritasDestino ?? []).map(Number),
            lugar: o.encuentro?.lugar ?? "",
            horaEncuentro: o.encuentro?.hora ?? "",
            rating: (o as Record<string, unknown>).rating ?? 0,
        };
    });

    return NextResponse.json(serializadas);
}
