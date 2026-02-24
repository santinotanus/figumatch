import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UsuarioModel } from "@/lib/models";

// GET /api/usuarios/by-firebase?firebaseUid=xxx&email=yyy
// Devuelve el usuario de MongoDB que corresponde a ese Firebase UID o email
export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get("firebaseUid") ?? "";
    const email = searchParams.get("email") ?? "";

    if (!firebaseUid && !email) {
        return NextResponse.json({ error: "firebaseUid o email requerido" }, { status: 400 });
    }

    const query = firebaseUid
        ? { $or: [{ googleId: firebaseUid }, { email }] }
        : { email };

    const usuario = await UsuarioModel.findOne(query)
        .select("_id nombre email foto avatar zonas repetidas faltantes reputacion cambiosHechos premium")
        .lean();

    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    return NextResponse.json(usuario);
}
