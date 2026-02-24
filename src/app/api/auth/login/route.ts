import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UsuarioModel } from "@/lib/models";

/**
 * POST /api/auth/login
 * Body: { uid, email, nombre, foto }
 * Recibe datos del usuario ya autenticado por Firebase (Google o email/pass).
 * Si el usuario no existe en MongoDB lo crea. Siempre devuelve el usuario.
 */
export async function POST(req: Request) {
    await connectDB();
    const { uid, email, nombre, foto } = await req.json();

    if (!uid || !email) {
        return NextResponse.json({ error: "uid y email son requeridos" }, { status: 400 });
    }

    // Buscar por googleId (uid de Firebase) o por email
    let usuario = await UsuarioModel.findOne({
        $or: [{ googleId: uid }, { email: email.toLowerCase() }],
    }).select("-password").lean();

    if (!usuario) {
        // Todas las figuritas del álbum (00 al 980) como faltantes por default
        const todasFaltantes = Array.from({ length: 981 }, (_, i) => i);

        const creado = await UsuarioModel.create({
            googleId: uid,
            email: email.toLowerCase(),
            nombre: nombre ?? email.split("@")[0],
            foto: foto ?? "",
            avatar: (nombre ?? email).slice(0, 2).toUpperCase(),
            ciudad: "",
            zonas: [],
            repetidas: [],
            faltantes: todasFaltantes,
        });
        usuario = creado.toObject();
        // @ts-expect-error password no existe en el objeto creado
        delete usuario.password;
        return NextResponse.json({ usuario, nuevo: true }, { status: 201 });
    }

    return NextResponse.json({ usuario, nuevo: false });
}
