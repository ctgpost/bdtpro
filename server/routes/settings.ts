import { Router, Request, Response } from "express";
import { getSetting, setSetting } from "../database/schema";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { key } = req.query as any;
    if (key) {
      const value = await getSetting(key);
      return res.json({ success: true, data: { [key]: value } });
    }

    const result = await (await import("../database/schema")).query("SELECT setting_key, setting_value FROM settings ORDER BY setting_key");
    const data = result.rows.reduce((acc: any, row: any) => ((acc[row.setting_key] = row.setting_value), acc), {});
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ success: false, message: "Key is required" });
    const setting = await setSetting(key, String(value));
    res.json({ success: true, data: setting });
  } catch (error) {
    console.error("Error setting setting:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
