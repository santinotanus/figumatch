import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UsuarioModel } from "@/lib/models";

// GET /api/usuarios — lista todos los usuarios (sin password ni googleId)
export async function GET() {
    await connectDB();
    const usuarios = await UsuarioModel.find({})
        .select("-password -googleId")
        .lean();
    return NextResponse.json(usuarios);
}

// POST /api/usuarios — crea un usuario nuevo (registro simple, sin hash por ahora)
export async function POST(req: Request) {
    await connectDB();
    const body = await req.json();
    const { nombre, email, ciudad, avatar, zonas } = body;

    if (!nombre || !email) {
        return NextResponse.json({ error: "nombre y email son obligatorios" }, { status: 400 });
    }

    const existe = await UsuarioModel.findOne({ email });
    if (existe) {
        return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const usuario = await UsuarioModel.create({
        nombre,
        email,
        ciudad: ciudad ?? "",
        avatar: avatar ?? nombre.slice(0, 2).toUpperCase(),
        zonas: zonas ?? [],
        repetidas: [],
        faltantes: [],
    });

    const result = usuario.toObject();
    delete result.password;
    delete result.googleId;
    return NextResponse.json(result, { status: 201 });
}
