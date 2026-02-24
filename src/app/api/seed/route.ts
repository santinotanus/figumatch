import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FiguriteModel } from "@/lib/models";

/**
 * GET /api/seed
 * Pobla la colección de figuritas con el catálogo inicial.
 * Solo correrlo una vez desde el navegador o con curl.
 */
export async function GET() {
    await connectDB();

    const catalogo = [
        // Argentina
        { id: "ARG-1",   numero: 1,   nombre: "Lionel Messi",            pais: "Argentina", tipo: "jugador" },
        { id: "ARG-2",   numero: 2,   nombre: "Julián Álvarez",           pais: "Argentina", tipo: "jugador" },
        { id: "ARG-3",   numero: 3,   nombre: "Rodrigo De Paul",          pais: "Argentina", tipo: "jugador" },
        { id: "ARG-4",   numero: 4,   nombre: "Enzo Fernández",           pais: "Argentina", tipo: "jugador" },
        { id: "ARG-5",   numero: 5,   nombre: "Emiliano Martínez",        pais: "Argentina", tipo: "jugador" },
        { id: "ARG-ESC", numero: 6,   nombre: "Escudo Argentina",         pais: "Argentina", tipo: "escudo"  },
        // Brasil
        { id: "BRA-1",   numero: 10,  nombre: "Vinicius Jr.",             pais: "Brasil",    tipo: "jugador" },
        { id: "BRA-2",   numero: 11,  nombre: "Rodrygo",                  pais: "Brasil",    tipo: "jugador" },
        { id: "BRA-3",   numero: 12,  nombre: "Casemiro",                 pais: "Brasil",    tipo: "jugador" },
        { id: "BRA-4",   numero: 13,  nombre: "Alisson",                  pais: "Brasil",    tipo: "jugador" },
        { id: "BRA-ESC", numero: 14,  nombre: "Escudo Brasil",            pais: "Brasil",    tipo: "escudo"  },
        // Francia
        { id: "FRA-1",   numero: 20,  nombre: "Kylian Mbappé",            pais: "Francia",   tipo: "jugador" },
        { id: "FRA-2",   numero: 21,  nombre: "Antoine Griezmann",        pais: "Francia",   tipo: "jugador" },
        { id: "FRA-3",   numero: 22,  nombre: "Aurélien Tchouaméni",      pais: "Francia",   tipo: "jugador" },
        { id: "FRA-ESC", numero: 23,  nombre: "Escudo Francia",           pais: "Francia",   tipo: "escudo"  },
        // España
        { id: "ESP-1",   numero: 30,  nombre: "Pedri",                    pais: "España",    tipo: "jugador" },
        { id: "ESP-2",   numero: 31,  nombre: "Gavi",                     pais: "España",    tipo: "jugador" },
        { id: "ESP-3",   numero: 32,  nombre: "Lamine Yamal",             pais: "España",    tipo: "jugador" },
        { id: "ESP-ESC", numero: 33,  nombre: "Escudo España",            pais: "España",    tipo: "escudo"  },
        // Alemania
        { id: "GER-1",   numero: 40,  nombre: "Florian Wirtz",            pais: "Alemania",  tipo: "jugador" },
        { id: "GER-2",   numero: 41,  nombre: "Jamal Musiala",            pais: "Alemania",  tipo: "jugador" },
        { id: "GER-ESC", numero: 42,  nombre: "Escudo Alemania",          pais: "Alemania",  tipo: "escudo"  },
        // Portugal
        { id: "POR-1",   numero: 50,  nombre: "Cristiano Ronaldo",        pais: "Portugal",  tipo: "jugador" },
        { id: "POR-2",   numero: 51,  nombre: "Bruno Fernandes",          pais: "Portugal",  tipo: "jugador" },
        { id: "POR-ESC", numero: 52,  nombre: "Escudo Portugal",          pais: "Portugal",  tipo: "escudo"  },
        // Uruguay
        { id: "URU-1",   numero: 60,  nombre: "Darwin Núñez",             pais: "Uruguay",   tipo: "jugador" },
        { id: "URU-2",   numero: 61,  nombre: "Federico Valverde",        pais: "Uruguay",   tipo: "jugador" },
        { id: "URU-ESC", numero: 62,  nombre: "Escudo Uruguay",           pais: "Uruguay",   tipo: "escudo"  },
        // Inglaterra
        { id: "ENG-1",   numero: 70,  nombre: "Jude Bellingham",          pais: "Inglaterra",tipo: "jugador" },
        { id: "ENG-2",   numero: 71,  nombre: "Harry Kane",               pais: "Inglaterra",tipo: "jugador" },
        { id: "ENG-ESC", numero: 72,  nombre: "Escudo Inglaterra",        pais: "Inglaterra",tipo: "escudo"  },
        // Especiales
        { id: "ESP-TROFEO",  numero: 100, nombre: "Trofeo Copa del Mundo", pais: "FIFA", tipo: "especial" },
        { id: "ESP-LOGO",    numero: 101, nombre: "Logo Mundial 2026",      pais: "FIFA", tipo: "especial" },
        { id: "ESP-MASCOTA", numero: 102, nombre: "Mascota Oficial",        pais: "FIFA", tipo: "especial" },
    ];

    const ops = catalogo.map((f) => ({
        updateOne: {
            filter: { id: f.id },
            update: { $set: f },
            upsert: true,
        },
    }));

    const result = await FiguriteModel.bulkWrite(ops);
    return NextResponse.json({
        ok: true,
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        message: `Catálogo cargado: ${catalogo.length} figuritas`,
    });
}
