import mongoose from "mongoose";

let connectionPromise;

export function connectDatabase() {
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/prime-smile-lab";

  connectionPromise = mongoose.connect(uri).then(() => {
    console.log("MongoDB connected");
  });

  return connectionPromise;
}
