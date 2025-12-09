const express = require("express");
const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Daftarkan font Pinyon Script
registerFont(path.join(__dirname, "fonts", "PinyonScript-Regular.ttf"), {
  family: "PinyonScript",
});

// Buat folder generated jika belum ada
const GENERATED_DIR = path.join(__dirname, "generated");
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR);
}

app.post("/generate", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nama wajib diisi" });
  }

  try {
    const templatePath = path.join(__dirname, "template.png");
    const template = await loadImage(templatePath);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(template, 0, 0, template.width, template.height);

    // Gunakan font Pinyon Script
    ctx.font = '120px "PinyonScript"';
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";

    // posisi X & Y hasil konversi cm → pixel
    const x = 1570;
    const y = 1245;

    ctx.fillText(name, x, y);

    const filename = `${name.replace(/\s+/g, "_")}.png`;
    const outputPath = path.join(GENERATED_DIR, filename);

    fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

    return res.json({
      status: "success",
      message: "Sertifikat berhasil dibuat",
      file: `/generated/${filename}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("Server berjalan di port 3000");
});
