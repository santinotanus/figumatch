import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Falta la variable de entorno MONGODB_URI en .env.local");
}

declare global {
    // eslint-disable-next-line no-var
    var _mongoosePromise: Promise<typeof mongoose> | null;
}

export async function connectDB() {
    // Si ya hay una conexión activa, reutilizarla
    if (mongoose.connection.readyState === 1) return mongoose;

    // Usar la promesa global para evitar múltiples conexiones en hot-reload
    if (!global._mongoosePromise) {
        global._mongoosePromise = mongoose.connect(MONGODB_URI);
    }

    await global._mongoosePromise;
    return mongoose;
}
