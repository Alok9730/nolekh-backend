import express from "express";
import OpenAI from "openai";
import mongoose from "mongoose";
import dotenv from "dotenv/config";
import rateLimit from "express-rate-limit";
import ProductSchema from "../../model/ProductEntrySchema.js";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, 
});


router.post("/DataEntry", limiter, async (req, res) => {
  try {
    const { customerId, monthName, transcript } = req.body;
    const shopkeeperId = req.user?.shopId;

    if (req.user.role !== "shopkeeper") {
      return res.status(403).json({ message: "Access denied" });
    }

    
    if (!customerId || !monthName || !transcript || !shopkeeperId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    if (transcript.length > 200) {
      return res.status(400).json({ message: "Transcript too long" });
    }

   
    const safeTranscript = transcript.replace(/[<>]/g, "");

   
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: `
You are a JSON extractor from shopkeeper voice input.

Rules:
- Extract clean structured data
- Output JSON array of:
  product, quantity, mrp
- Allowed units: kg, g, l, pk, b, pc
- Normalize values
- If invalid → return [{ "error": "Invalid input" }]
- DO NOT explain anything
`,
        },
        {
          role: "user",
          content: safeTranscript,
        },
      ],
    });

    const rawContent = aiResponse.choices[0]?.message?.content?.trim();

    let items;
    try {
      items = JSON.parse(rawContent);
    } catch {
      return res.status(400).json({ error: "Invalid AI response format" });
    }

   
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No valid items found" });
    }

    if (items[0]?.error) {
      return res.status(400).json({ error: items[0].error });
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.product || !item.quantity || !item.mrp) continue;

      const rate = parseFloat(
        item.mrp.toString().replace(/[^\d.]/g, "")
      );

      if (isNaN(rate)) continue;

      totalAmount += rate;

      processedItems.push({
        productName: item.product,
        quantity: item.quantity,
        rate,
      });
    }

    if (processedItems.length === 0) {
      return res.status(400).json({ error: "No valid product items" });
    }

    const latestEntry = await ProductSchema.findOne({
      shopkeeperId,
      customerId,
      month: monthName,
    }).sort({ updatedAt: -1 });

    let updatedEntry;

    if (!latestEntry) {
      updatedEntry = await ProductSchema.create({
        shopkeeperId,
        customerId,
        month: monthName,
        items: processedItems,
        totalAmount,
        status: "Unpaid",
      });
    } else {
      const timeDiff =
        (Date.now() - latestEntry.updatedAt.getTime()) / 1000;

      if (timeDiff <= 10) {
        updatedEntry = await ProductSchema.findOneAndUpdate(
          {
            _id: latestEntry._id,
            shopkeeperId, 
          },
          {
            $push: { items: { $each: processedItems } },
            $inc: { totalAmount },
          },
          { new: true }
        );
      } else {
        updatedEntry = await ProductSchema.create({
          shopkeeperId,
          customerId,
          month: monthName,
          items: processedItems,
          totalAmount,
          status: "Unpaid",
        });
      }
    }

    res.status(201).json({
      message: "Voice entry saved",
      data: {
        id: updatedEntry._id,
        totalAmount: updatedEntry.totalAmount,
        itemCount: updatedEntry.items.length,
      },
    });

  } catch (err) {
    console.error("Voice Process Error:", err.message);
    res.status(500).json({ error: "Processing failed" });
  }
});

export default router;