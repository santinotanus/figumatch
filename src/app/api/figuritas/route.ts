import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FiguriteModel } from "@/lib/models";

// GET /api/figuritas — devuelve todas las figuritas del catálogo
export async function GET() {
    await connectDB();
    const figuritas = await FiguriteModel.find({}).lean();
    return NextResponse.json(figuritas);
}

// POST /api/figuritas — crea o actualiza el catálogo (seed)
export async function POST(req: Request) {
    await connectDB();
    const body = await req.json();
    const figuritas = Array.isArray(body) ? body : [body];

    const ops = figuritas.map((f) => ({
        updateOne: {
            filter: { id: f.id },
            update: { $set: f },
            upsert: true,
        },
    }));

    await FiguriteModel.bulkWrite(ops);
    return NextResponse.json({ ok: true, count: figuritas.length });
}
