import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { OfertaModel, UsuarioModel } from "@/lib/models";

// Decodifica el Firebase JWT para obtener uid y email del usuario logueado
function getFirebaseClaimsFromToken(authHeader: string | null): { uid: string; email: string } {
    if (!authHeader?.startsWith("Bearer ")) return { uid: "", email: "" };
    const token = authHeader.slice(7);
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        return {
            uid: decoded.user_id ?? decoded.sub ?? "",
            email: decoded.email ?? "",
        };
    } catch {
        return { uid: "", email: "" };
    }
}

// GET /api/ofertas/[id]
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    const { id } = await params;

    const oferta = await OfertaModel.findById(id)
        .populate("remitenteId", "-password -googleId")
        .populate("destinatarioId", "-password -googleId")
        .lean() as Record<string, unknown> | null;

    if (!oferta) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });

    // Resolver el mongoId del usuario logueado desde el Firebase token
    const { uid: firebaseUid, email: firebaseEmail } = getFirebaseClaimsFromToken(req.headers.get("Authorization"));
    let myMongoId = "";
    if (firebaseUid || firebaseEmail) {
        const usuario = await UsuarioModel.findOne(
            firebaseUid
                ? { $or: [{ googleId: firebaseUid }, { email: firebaseEmail }] }
                : { email: firebaseEmail }
        ).select("_id").lean() as Record<string, unknown> | null;
        if (usuario) myMongoId = String(usuario._id);
    }
    // Fallback: uid del query param (para compatibilidad)
    if (!myMongoId) {
        const { searchParams } = new URL(req.url);
        myMongoId = searchParams.get("uid") ?? "";
    }

    const enc = oferta.encuentro as Record<string, unknown> | undefined;
    const rem = oferta.remitenteId as Record<string, unknown>;
    const dest = oferta.destinatarioId as Record<string, unknown>;

    let encuentro = enc ?? null;
    if (enc && enc.lugar) {
        const pid = enc.propuestoPorId;
        const pidStr = pid ? String(pid) : "";
        const propuestoPorMi = myMongoId ? pidStr === myMongoId : false;

        let propuestoPorNombre = (enc.propuestoPorNombre as string) || "";
        if (!propuestoPorNombre && pidStr) {
            if (String(rem._id) === pidStr) propuestoPorNombre = String(rem.nombre ?? "");
            else if (String(dest._id) === pidStr) propuestoPorNombre = String(dest.nombre ?? "");
        }

        encuentro = { ...enc, propuestoPorMi, propuestoPorNombre };
    } else if (enc && !enc.lugar) {
        encuentro = null;
    }

    const remId = String(rem._id);
    const yoSoyRemitente = myMongoId === remId;
    const yoConfirme = yoSoyRemitente
        ? !!(oferta.confirmadoPorRemitente)
        : !!(oferta.confirmadoPorDestinatario);
    const otroConfirmo = yoSoyRemitente
        ? !!(oferta.confirmadoPorDestinatario)
        : !!(oferta.confirmadoPorRemitente);

    return NextResponse.json({ ...oferta, encuentro, _myMongoId: myMongoId, yoConfirme, otroConfirmo });
}

// PATCH /api/ofertas/[id]
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Identificar al usuario logueado por Firebase token
    const authHeader = req.headers.get("Authorization");
    const { uid: firebaseUid, email: firebaseEmail } = getFirebaseClaimsFromToken(authHeader);
    let usuarioLogueado: Record<string, unknown> | null = null;
    if (firebaseUid || firebaseEmail) {
        usuarioLogueado = await UsuarioModel.findOne(
            firebaseUid
                ? { $or: [{ googleId: firebaseUid }, { email: firebaseEmail }] }
                : { email: firebaseEmail }
        ).lean() as Record<string, unknown> | null;
    }

    const update: Record<string, unknown> = {};

    // ── Caso: solo actualizar el rating (ya confirmó antes) ──────────────────
    if (body.accion === "actualizarRating") {
        const ofertaActual = await OfertaModel.findById(id).lean() as Record<string, unknown> | null;
        if (!ofertaActual) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });

        const miId = usuarioLogueado ? String(usuarioLogueado._id) : "";
        const remId = String(ofertaActual.remitenteId);
        const soyRemitente = miId === remId;
        const campoRating = soyRemitente ? "ratingRemitente" : "ratingDestinatario";
        const ratingDado = Number(body.rating) || 0;

        await OfertaModel.findByIdAndUpdate(id, { $set: { [campoRating]: ratingDado } });

        // Aplicar el rating a la reputación del otro usando cantidadRatings
        const idParaOtro = soyRemitente ? String(ofertaActual.destinatarioId) : remId;
        if (ratingDado > 0) {
            const usuOtro = await UsuarioModel.findById(idParaOtro).select("reputacion cantidadRatings").lean() as { reputacion?: number; cantidadRatings?: number } | null;
            const repActual = Number(usuOtro?.reputacion) || 0;
            const cantActual = Number(usuOtro?.cantidadRatings) || 0;
            const nuevaRep = Math.round(((repActual * cantActual + ratingDado) / (cantActual + 1)) * 10) / 10;
            await UsuarioModel.findByIdAndUpdate(idParaOtro, {
                $inc: { cantidadRatings: 1 },
                $set: { reputacion: nuevaRep },
            });
        }

        const ofertaActualizada = await OfertaModel.findById(id)
            .populate("remitenteId", "-password -googleId")
            .populate("destinatarioId", "-password -googleId")
            .lean();
        return NextResponse.json(ofertaActualizada);
    }

    // ── Caso: confirmar que el intercambio se realizó ─────────────────────────
    if (body.accion === "confirmarRealizado") {
        const ofertaActual = await OfertaModel.findById(id).lean() as Record<string, unknown> | null;
        if (!ofertaActual) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });

        const miId = usuarioLogueado ? String(usuarioLogueado._id) : "";
        const remId = String(ofertaActual.remitenteId);
        const destId = String(ofertaActual.destinatarioId);
        const soyRemitente = miId === remId;
        const soyDestinatario = miId === destId;

        if (!soyRemitente && !soyDestinatario) {
            return NextResponse.json({ error: "No sos parte de este intercambio" }, { status: 403 });
        }

        // Evitar doble confirmación del mismo usuario
        const yaConfirme = soyRemitente
            ? ofertaActual.confirmadoPorRemitente
            : ofertaActual.confirmadoPorDestinatario;
        if (yaConfirme) {
            // Ya confirmó — solo devolver la oferta actual sin cambios
            const ofertaActualizada = await OfertaModel.findById(id)
                .populate("remitenteId", "-password -googleId")
                .populate("destinatarioId", "-password -googleId")
                .lean();
            return NextResponse.json(ofertaActualizada);
        }

        const ratingDado = Number(body.rating) || 0;
        const campoConfirmacion = soyRemitente ? "confirmadoPorRemitente" : "confirmadoPorDestinatario";
        const campoRating = soyRemitente ? "ratingRemitente" : "ratingDestinatario";
        const otroYaConfirmo = soyRemitente
            ? ofertaActual.confirmadoPorDestinatario
            : ofertaActual.confirmadoPorRemitente;

        // Marcar mi confirmación y mi rating
        update[campoConfirmacion] = true;
        update[campoRating] = ratingDado;

        // Si el otro ya confirmó → ambos confirmaron → completar
        if (otroYaConfirmo) {
            update["estado"] = "completada";

            const ofertaCompleta = await OfertaModel.findById(id).lean() as Record<string, unknown>;
            // Las figuritas pueden estar guardadas como número o string en BD → incluir ambas formas
            const figsRemStr = ((ofertaCompleta.figuritasRemitente as unknown[]) ?? []).map(String);
            const figsDestStr = ((ofertaCompleta.figuritasDestino as unknown[]) ?? []).map(String);
            const figsRemNum = figsRemStr.map(Number).filter(n => !isNaN(n));
            const figsDestNum = figsDestStr.map(Number).filter(n => !isNaN(n));

            // Remitente: recibe figsDest → sacar de sus faltantes; entrega figsRem → sacar de sus repetidas
            await UsuarioModel.findByIdAndUpdate(remId, {
                $pull: {
                    faltantes: { $in: [...figsDestStr, ...figsDestNum] },
                    repetidas: { $in: [...figsRemStr, ...figsRemNum] },
                },
            });

            // Destinatario: recibe figsRem → sacar de sus faltantes; entrega figsDest → sacar de sus repetidas
            await UsuarioModel.findByIdAndUpdate(destId, {
                $pull: {
                    faltantes: { $in: [...figsRemStr, ...figsRemNum] },
                    repetidas: { $in: [...figsDestStr, ...figsDestNum] },
                },
            });

            // Rating que el otro ya puso (guardado en el PATCH anterior del otro usuario)
            const ratingParaMi = soyRemitente
                ? Number(ofertaActual.ratingDestinatario) || 0
                : Number(ofertaActual.ratingRemitente) || 0;

            const idParaMi = miId;
            const idParaOtro = soyRemitente ? destId : remId;

            // Leer datos actuales de ambos usuarios ANTES de modificarlos
            const [usuMi, usuOtro] = await Promise.all([
                UsuarioModel.findById(idParaMi).select("reputacion cantidadRatings").lean() as { reputacion?: number; cantidadRatings?: number } | null,
                UsuarioModel.findById(idParaOtro).select("reputacion cantidadRatings").lean() as { reputacion?: number; cantidadRatings?: number } | null,
            ]);

            // Calcular nueva reputación inline (promedio ponderado solo sobre ratings reales)
            const calcRep = (usuario: Record<string, unknown>, nuevoRating: number) => {
                const repActual = Number(usuario?.reputacion) || 0;
                const cantActual = Number(usuario?.cantidadRatings) || 0;
                return Math.round(((repActual * cantActual + nuevoRating) / (cantActual + 1)) * 10) / 10;
            };

            // Actualizar mi reputación y cambiosHechos
            if (ratingParaMi > 0) {
                await UsuarioModel.findByIdAndUpdate(idParaMi, {
                    $inc: { cambiosHechos: 1, cantidadRatings: 1 },
                    $set: { reputacion: calcRep(usuMi ?? {}, ratingParaMi) },
                });
            } else {
                await UsuarioModel.findByIdAndUpdate(idParaMi, { $inc: { cambiosHechos: 1 } });
            }

            // Actualizar reputación y cambiosHechos del otro
            if (ratingDado > 0) {
                await UsuarioModel.findByIdAndUpdate(idParaOtro, {
                    $inc: { cambiosHechos: 1, cantidadRatings: 1 },
                    $set: { reputacion: calcRep(usuOtro ?? {}, ratingDado) },
                });
            } else {
                await UsuarioModel.findByIdAndUpdate(idParaOtro, { $inc: { cambiosHechos: 1 } });
            }
        }

        const ofertaActualizada = await OfertaModel.findByIdAndUpdate(
            id, { $set: update }, { new: true }
        ).populate("remitenteId", "-password -googleId").populate("destinatarioId", "-password -googleId").lean();

        return NextResponse.json(ofertaActualizada);
    }

    // ── Caso normal: cambiar estado/encuentro ─────────────────────────────────
    if ("estado" in body) update["estado"] = body.estado;

    if ("encuentro" in body && body.encuentro) {
        const enc = { ...body.encuentro };
        if (usuarioLogueado) {
            enc.propuestoPorId = usuarioLogueado._id;
            enc.propuestoPorNombre = usuarioLogueado.nombre ?? "";
        }
        update["encuentro"] = enc;
    }

    const oferta = await OfertaModel.findByIdAndUpdate(
        id, { $set: update }, { new: true }
    ).populate("remitenteId", "-password -googleId").populate("destinatarioId", "-password -googleId").lean();

    if (!oferta) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
    return NextResponse.json(oferta);
}

// DELETE /api/ofertas/[id]
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    const { id } = await params;
    await OfertaModel.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
}
