// server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { db } from "./config/db.js";
// ----------------------------------------------------------------
// CORS CONFIG
// ----------------------------------------------------------------
const allowedOrigins = [
    "http://localhost:3000",
    "https://adminportal-2r3x.vercel.app",
].filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        // allow Postman / backend calls with no Origin header
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn("[CORS BLOCKED]:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
// ----------------------------------------------------------------
// EXPRESS APP
// ----------------------------------------------------------------
const app = express();
// ✅ APPLY CORS HERE (BEFORE ROUTES)
app.use(cors(corsOptions));
// ✅ REMOVE THIS (it crashes Express 5)
// app.options("*", cors(corsOptions));
app.use(express.json());
// Health check
app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "Auth service running" });
});
// Routes
app.use("/api/v1/auth", authRoutes);
// Global error handler
app.use((err, _req, res, _next) => {
    console.error("[ERROR]", err);
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ message: "CORS error: origin not allowed" });
    }
    return res.status(500).json({ message: "Internal server error" });
});
// ----------------------------------------------------------------
// START SERVER AFTER DB CONNECTION
// ----------------------------------------------------------------
const PORT = process.env.PORT || 4000;
db.getConnection()
    .then(() => {
    console.log("✅ Connected to MySQL");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
    .catch((err) => {
    console.error("❌ DB connection failed:", err.message || err);
    process.exit(1);
});
export default app;
//# sourceMappingURL=server.js.map