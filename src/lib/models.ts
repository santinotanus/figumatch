import mongoose, { Schema, model, models } from "mongoose";

// ─── Figurita ────────────────────────────────────────────────────────────────
const FiguriteSchema = new Schema({
    id:     { type: String, required: true, unique: true },
    numero: { type: Number, required: true },
    nombre: { type: String, required: true },
    pais:   { type: String, required: true },
    tipo:   { type: String, enum: ["jugador", "escudo", "estadio", "especial"], required: true },
});

export const FiguriteModel =
    models.Figurite || model("Figurite", FiguriteSchema);

// ─── Usuario ─────────────────────────────────────────────────────────────────
const UsuarioSchema = new Schema(
    {
        nombre:        { type: String, required: true },
        email:         { type: String, required: true, unique: true, lowercase: true },
        password:      { type: String },           // hash bcrypt (null si usa Google)
        googleId:      { type: String },           // ID de Google OAuth
        ciudad:        { type: String, default: "" },
        avatar:        { type: String, default: "" },
        foto:          { type: String },           // URL o base64
        premium:       { type: Boolean, default: false },
        repetidas:     [{ type: String }],         // números de figuritas como strings ("0"-"980")
        faltantes:     [{ type: String }],         // números de figuritas como strings ("0"-"980")
        zonas:         [{ type: String }],         // Hasta 3 zonas
        especiales:    { type: Map, of: Number, default: {} }, // figId → precio
        reputacion:    { type: Number, default: 0 },
        cambiosHechos: { type: Number, default: 0 },
        cantidadRatings: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const UsuarioModel =
    process.env.NODE_ENV === "development"
        ? (() => { delete (mongoose.models as Record<string, unknown>).Usuario; return model("Usuario", UsuarioSchema); })()
        : (models.Usuario || model("Usuario", UsuarioSchema));

// ─── Oferta ───────────────────────────────────────────────────────────────────
const EncuentroSchema = new Schema(
    {
        lugar:             { type: String },
        fecha:             { type: String },
        hora:              { type: String },
        comentario:        { type: String },
        propuestoPorId:    { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
        propuestoPorNombre:{ type: String },
        esContraoferta:    { type: Boolean, default: false },
        aceptado:          { type: Boolean, default: false },
    },
    { _id: false, strict: false }
);

const OfertaSchema = new Schema(
    {
        remitenteId:        { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
        destinatarioId:     { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
        figuritasRemitente: [{ type: Number }],
        figuritasDestino:   [{ type: Number }],
        estado: {
            type: String,
            enum: ["pendiente", "activa", "rechazada", "cancelada", "completada"],
            default: "pendiente",
        },
        encuentro: { type: EncuentroSchema },
        // Confirmación individual — se completa cuando ambos confirman
        confirmadoPorRemitente:    { type: Boolean, default: false },
        confirmadoPorDestinatario: { type: Boolean, default: false },
        ratingRemitente:           { type: Number, default: 0 }, // rating que puso el remitente al dest
        ratingDestinatario:        { type: Number, default: 0 }, // rating que puso el dest al remitente
    },
    { timestamps: true }
);

export const OfertaModel = models.Oferta || model("Oferta", OfertaSchema);
