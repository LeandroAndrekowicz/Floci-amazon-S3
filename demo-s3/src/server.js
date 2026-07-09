const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const STORAGE_ROOT = path.join(__dirname, "..", "storage");
fs.mkdirSync(STORAGE_ROOT, { recursive: true });

const app = express();
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const isSafeName = (name) => /^[a-zA-Z0-9._-]+$/.test(name);
const bucketPath = (bucket) => path.join(STORAGE_ROOT, bucket);
const objectPath = (bucket, key) => path.join(bucketPath(bucket), key);

function requireSafeBucket(req, res, next) {
  if (!isSafeName(req.params.bucket)) {
    return res.status(400).json({ error: "Nome de bucket inválido" });
  }
  next();
}

function requireSafeKey(req, res, next) {
  if (!isSafeName(req.params.key)) {
    return res.status(400).json({ error: "Nome de objeto (key) inválido" });
  }
  next();
}

app.put("/buckets/:bucket", requireSafeBucket, (req, res) => {
  const dir = bucketPath(req.params.bucket);
  if (fs.existsSync(dir)) {
    return res.status(409).json({ error: "Bucket já existe" });
  }
  fs.mkdirSync(dir);
  res.status(201).json({ bucket: req.params.bucket, message: "Bucket criado" });
});

app.get("/buckets", (req, res) => {
  const buckets = fs
    .readdirSync(STORAGE_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  res.json({ buckets });
});

app.delete("/buckets/:bucket", requireSafeBucket, (req, res) => {
  const dir = bucketPath(req.params.bucket);
  if (!fs.existsSync(dir)) {
    return res.status(404).json({ error: "Bucket não encontrado" });
  }
  if (fs.readdirSync(dir).length > 0) {
    return res.status(409).json({ error: "Bucket não está vazio" });
  }
  fs.rmdirSync(dir);
  res.json({ message: "Bucket removido" });
});

app.get("/buckets/:bucket/objects", requireSafeBucket, (req, res) => {
  const dir = bucketPath(req.params.bucket);
  if (!fs.existsSync(dir)) {
    return res.status(404).json({ error: "Bucket não encontrado" });
  }
  const objects = fs.readdirSync(dir).map((key) => {
    const stat = fs.statSync(path.join(dir, key));
    return { key, size: stat.size, lastModified: stat.mtime };
  });
  res.json({ objects });
});

app.put(
  "/buckets/:bucket/objects/:key",
  requireSafeBucket,
  requireSafeKey,
  upload.single("file"),
  (req, res) => {
    const dir = bucketPath(req.params.bucket);
    if (!fs.existsSync(dir)) {
      return res.status(404).json({ error: "Bucket não encontrado" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado (campo 'file')" });
    }
    fs.writeFileSync(objectPath(req.params.bucket, req.params.key), req.file.buffer);
    res.status(201).json({
      bucket: req.params.bucket,
      key: req.params.key,
      size: req.file.buffer.length,
      message: "Objeto enviado",
    });
  }
);

app.get("/buckets/:bucket/objects/:key", requireSafeBucket, requireSafeKey, (req, res) => {
  const file = objectPath(req.params.bucket, req.params.key);
  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: "Objeto não encontrado" });
  }
  res.download(file, req.params.key);
});

app.delete("/buckets/:bucket/objects/:key", requireSafeBucket, requireSafeKey, (req, res) => {
  const file = objectPath(req.params.bucket, req.params.key);
  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: "Objeto não encontrado" });
  }
  fs.unlinkSync(file);
  res.json({ message: "Objeto removido" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Demo S3 (Floci) rodando em http://localhost:${PORT}`);
});
