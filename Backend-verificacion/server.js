// -----------------------------
// 🧩 DEPENDENCIAS PRINCIPALES
// -----------------------------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

dotenv.config(); // Carga las variables del archivo .env

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// 🧩 CONFIGURACIÓN TWILIO Y SUPABASE
// -----------------------------
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// -----------------------------
// 📨 1️⃣ ENVIAR CÓDIGO DE VERIFICACIÓN
// -----------------------------
app.post("/enviar-codigo", async (req, res) => {
  try {
    
    console.log("📩 Datos recibidos:", req.body);

    const { numero } = req.body;
    if (!numero) return res.status(400).json({ error: "Falta el número" });

    // Verificar si el número ya está en uso
    const { data: usuarioExistente } = await supabase
      .from("registro")
      .select("*")
      .eq("numero", numero)
      .single();

    if (usuarioExistente) {
      return res.status(400).json({ error: "Este número ya está registrado" });
    }

    // Enviar código con Twilio Verify
    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({ to: `+57${numero}`, channel: "sms" });

    console.log("✅ Twilio respuesta:", verification.status);

    res.json({ success: true, message: "Código de verificación enviado correctamente" });
  } catch (error) {
    console.error("💥 Error en /enviar-codigo:", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
// ✅ 2️⃣ VERIFICAR CÓDIGO
// -----------------------------
app.post("/verificar-codigo", async (req, res) => {
  const { numero, codigo, user, contrasena, fecha } = req.body;

  try {
    // Verificar el código ingresado
    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: `+57${numero}`, codigo });

    if (verification.status !== "approved") {
      return res.status(400).json({ error: "Código incorrecto o expirado" });
    }

    // Guardar usuario en Supabase
    const { error: insertError } = await supabase
      .from("registro")
      .insert([{ user, numero, contrasena, fecha }]);

    if (insertError) throw insertError;

    res.json({ message: "Usuario verificado y registrado correctamente" });
  } catch (error) {
    console.error("💥 Error verificando código:", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
// 🚀 INICIAR SERVIDOR
// -----------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
