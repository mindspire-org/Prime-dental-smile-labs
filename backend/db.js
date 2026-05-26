import mongoose from "mongoose";

let connectionPromise;

export function connectDatabase() {
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/prime-smile-lab";

  mongoose.connection.on("connected", () => console.log("✅ MongoDB connected:", uri.replace(/:\/\/[^@]+@/, "://***@")));
  mongoose.connection.on("error",     (err) => console.error("❌ MongoDB error:", err.message));
  mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"));

  connectionPromise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .catch((err) => {
      console.error("\n❌ MongoDB connection FAILED:", err.message);
      console.error("   URI:", uri.replace(/:\/\/[^@]+@/, "://***@"));
      console.error("   ▶ Is MongoDB running? Start it or set MONGODB_URI in backend/.env to an Atlas URI.\n");
      // Don't re-throw — let the server start; routes will 503 on DB operations
    });

  return connectionPromise;
}

export function isConnected() {
  return mongoose.connection.readyState === 1;
}
