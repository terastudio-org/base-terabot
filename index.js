import { connectToWhatsApp, sessions, serializeMessage } from "./base.js";

try {
  const { sock, events } = await connectToWhatsApp({
    folder: "session",
    type_connection: "pairing", // atau "qr"
    phoneNumber: "6285124252139",
    autoread: true,
  });

  // Bersihkan cache files
  sock.clearDirectory("tmp");

  console.log("🚀 Bot sedang menghubungkan ke WhatsApp...");

  // 📡 Event: ketika koneksi berhasil
  events.on("connected", () => console.log("✅ Bot berhasil terhubung!"));

  // 💬 Event: pesan masuk
  events.on("message", async (msg) => {
    const {
      id,
      remoteJid,
      sender,
      content,
      type,
      isQuoted,
      quotedMessage,
      message,
      m,
    } = msg;
    //const { sock } = m;

    console.log(`💬 Pesan dari ${sender}:`, content);
    if (content == "ping") {
      await sock.sendMessage(remoteJid, {
        text: "Pong 👋 ini pesan otomatis dari bot!",
      });
      return;
    }

    // Jika pesan berisi media (contoh: gambar)
    if (type === "image") {
      const mediaPath = await sock.downloadMedia(message);
      if (mediaPath) console.log("📥 Gambar tersimpan di:", mediaPath);

      // Kirim balasan dengan file

      await sock.sendMessage(remoteJid, {
        image: { url: mediaPath },
        caption: "Ini contoh gambar dari bot 🖼️",
      });
    }

    // Jika pesan membalas media lain
    if (isQuoted && quotedMessage) {
      const quotedPath = await sock.downloadQuotedMedia(message);
      if (quotedPath) console.log("📥 Media quoted tersimpan di:", quotedPath);
    }
  });

  // 📞 Event: panggilan masuk
  events.on("call", ({ from }) =>
    console.log("📞 Panggilan masuk dari:", from)
  );

  // 👥 Event: grup diperbarui (member join/leave, nama, dll)
  events.on("group-update", (update) =>
    console.log("👥 Grup diperbarui:", update)
  );

  // ❌ Event: koneksi terputus
  events.on("disconnected", (reason) =>
    console.log("❌ Koneksi terputus:", reason)
  );
} catch (err) {
  console.error("❗ Gagal menghubungkan bot:", err.message);
}
