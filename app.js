import express from "express";
import { createWorker } from "tesseract.js";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import fs from "fs";
import textToSpeech from "@google-cloud/text-to-speech";

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

const app = express();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const upload = multer({
  dest: __dirname + "/uploads/",
});

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/upload", upload.single("img"), async (req, res, next) => {
  const worker = createWorker({
    logger: (m) => console.log(m),
  });

  (async () => {
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(
      "https://tesseract.projectnaptha.com/img/eng_bw.png"
    );
    console.log(text);

    await worker.terminate();

    console.log(req.file);

    const request = {
      input: { text },
      // Select the language and SSML Voice Gender (optional)
      voice: {
        languageCode: "ko_KR",
        ssmlGender: "FEMALE",
        name: "ko-KR-Wavenet-A",
      },
      // Select the type of audio encoding
      audioConfig: { audioEncoding: "MP3" },
    };

    // Performs the Text-to-Speech request
    client.synthesizeSpeech(request, (err, response) => {
      if (err) {
        console.error("ERROR:", err);
        return;
      }

      var ts_hms = Date.now().toString();

      fs.writeFile(
        __dirname + ts_hms + ".mp3",
        response.audioContent,
        "binary",
        (err) => {
          if (err) {
            console.error("ERROR:", err);
            return;
          }
          console.log(__dirname + ts_hms + ".mp3");
          res.json({ ok: true, text });
        }
      );
    });
  })();
});

app.listen(3000, () => {
  // The text to synthesize
  const text = "안녕하세요";

  // Construct the request
});
