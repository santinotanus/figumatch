import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { OfertaModel, UsuarioModel } from "@/lib/models";

// GET /api/ofertas?usuarioId=xxx — serializa desde la perspectiva del usuario
export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuarioId");

    if (!usuarioId) return NextResponse.json({ error: "Falta usuarioId" }, { status: 400 });

    const ofertas = await OfertaModel.find({
        $or: [{ remitenteId: usuarioId }, { destinatarioId: usuarioId }],
        estado: { $in: ["pendiente", "activa"] },
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

        const estado = o.estado === "activa" ? "activa"
            : yoSoyRemitente ? "pendiente_ellos"
            : "pendiente_yo";

        return {
            id: String(o._id),
            usuarioId: String(otro._id),
            usuarioNombre: otro.nombre,
            usuarioFoto: otro.foto ?? "",
            usuarioAvatar: otro.avatar ?? String(otro.nombre).slice(0, 2).toUpperCase(),
            usuarioCiudad: otro.ciudad ?? "",
            usuarioReputacion: otro.reputacion ?? 0,
            // Desde mi perspectiva: recibo lo que el otro ofrece, entrego lo que el otro pide
            figuritasQueRecibo: yoSoyRemitente
                ? (o.figuritasDestino ?? []).map(Number)
                : (o.figuritasRemitente ?? []).map(Number),
            figuritasQueEntrego: yoSoyRemitente
                ? (o.figuritasRemitente ?? []).map(Number)
                : (o.figuritasDestino ?? []).map(Number),
            estado,
            fecha: o.createdAt,
            encuentro: o.encuentro ?? null,
        };
    });

    return NextResponse.json(serializadas);
}

// POST /api/ofertas — crea una oferta nueva
export async function POST(req: Request) {
    await connectDB();
    const body = await req.json();
    const { remitenteId, destinatarioId, figuritasRemitente, figuritasDestino } = body;

    if (!remitenteId || !destinatarioId || !figuritasRemitente || !figuritasDestino) {
        return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const [remitente, destinatario] = await Promise.all([
        UsuarioModel.findById(remitenteId),
        UsuarioModel.findById(destinatarioId),
    ]);
    if (!remitente || !destinatario) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const oferta = await OfertaModel.create({
        remitenteId,
        destinatarioId,
        figuritasRemitente: (figuritasRemitente ?? []).map(Number),
        figuritasDestino: (figuritasDestino ?? []).map(Number),
        estado: "pendiente",
    });

    return NextResponse.json(oferta, { status: 201 });
}
