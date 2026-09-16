import { MongoClient, Db } from "mongodb";

const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getCleanMongoUri(): string | null {
  const raw = process.env.MONGODB_URI;
  if (!raw) return null;
  // Strip potential quotes or leading/trailing whitespace
  return raw.trim().replace(/^["']|["']$/g, "").trim();
}

export function getMongoClientPromise(): Promise<MongoClient> | null {
  const mongoUri = getCleanMongoUri();
  if (!mongoUri) {
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(mongoUri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(mongoUri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getDb(): Promise<Db | null> {
  try {
    const promise = getMongoClientPromise();
    if (!promise) {
      console.warn("process.env.MONGODB_URI is not set or empty.");
      return null;
    }
    const client = await promise;
    return client.db("lazyflow");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err);
    return null;
  }
}
