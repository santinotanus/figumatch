import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UsuarioModel } from "@/lib/models";

// GET /api/usuarios/[id]
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    const { id } = await params;
    const usuario = await UsuarioModel.findById(id)
        .select("-password -googleId")
        .lean();
    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    return NextResponse.json(usuario);
}

// PATCH /api/usuarios/[id] — actualiza campos del usuario (nombre, ciudad, zonas, foto, repetidas, faltantes)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Campos permitidos para actualizar
    const allowed = ["nombre", "ciudad", "avatar", "foto", "zonas", "repetidas", "faltantes", "premium", "especiales"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in body) update[key] = body[key];
    }

    const usuario = await UsuarioModel.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true, select: "-password -googleId" }
    ).lean();

    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    return NextResponse.json(usuario);
}

// DELETE /api/usuarios/[id]
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    const { id } = await params;
    await UsuarioModel.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
}
