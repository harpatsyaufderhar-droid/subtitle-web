const express = require("express");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(express.static("public"));

const upload = multer({
  dest: "uploads/"
});

app.post("/upload", upload.single("video"), (req, res) => {

  const videoPath = req.file.path;
  const outputDir = "uploads";

  const command =
    `python -m whisper "${videoPath}" --model base --output_dir ${outputDir}`;

  exec(command, (error, stdout, stderr) => {

    if (error) {
      return res.send(`
        <h1>字幕生成失败</h1>
        <pre>${stderr}</pre>
      `);
    }

    const files = fs.readdirSync(outputDir);

    const txtFile = files.find(f => f.endsWith(".txt"));
    const srtFile = files.find(f => f.endsWith(".srt"));

    let txtContent = "";

    if (txtFile) {
      txtContent = fs.readFileSync(
        path.join(outputDir, txtFile),
        "utf8"
      );
    }

    res.send(`
      <h1>字幕生成成功</h1>

      <h2>识别文本：</h2>

      <pre style="
        white-space: pre-wrap;
        font-size:18px;
        line-height:1.8;
      ">${txtContent}</pre>

      <hr>

      <a href="/uploads/${srtFile}" download>
        下载 SRT 字幕
      </a>
    `);

  });

});

app.use("/uploads", express.static("uploads"));

app.listen(3000, () => {
  console.log("服务器启动：http://localhost:3000");
});