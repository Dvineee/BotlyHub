import appPromise from "../server";

export default async (req: any, res: any) => {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (err: any) {
    console.error("[VERCEL SERVERLESS ERROR]", err);
    res.status(500).json({ error: "Serverless execution failed", message: err.message });
  }
};
