import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv/config";
import ProductSchema from "../../model/ProductEntrySchema.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const router = express.Router();

router.post("/DataEntry", async (req, res) => {
  try {
    const { customerId, monthName, transcript } = req.body;
    const shopkeeperId = req.user?.shopId;
    if (!transcript || !customerId || !monthName || !shopkeeperId) {
      return res.status(400).json({ message: "Missing required fields!" });
    }


    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are a JSON extractor from shopkeeper voice input.

Rules:
- Extract clean structured data from transcript.
- Output should be a JSON array of items with:
  - product
  - quantity
  - mrp
-  Any unit outside this list (example: inch, cm, ml, spoon, glass, slice, packet-size, guesswork) is INVALID.
  Allowed quantity units ONLY:
   - kg, g, l, pk, b, pc
- Normalize:
  - kilo → kg, gram → g, liter → l, packet → pk, box → b , piece->pc , 
  - "four kg" → "4kg" integer type
- Multiple items separated by "." or "dot"
- If invalid input → return [{ "error": "Invalid input. Please mention product, quantity, and price." }]
- Do not explain. Just return valid JSON.
-can add multiple json based on user input

Input: "${transcript}"
`.trim(),
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    });

    const rawContent = aiResponse.choices[0]?.message?.content?.trim();

    let items;
    try {
      items = JSON.parse(rawContent);
    } catch (err) {
      return res.status(400).json({ error: "Invalid AI response format." });
    }

    if (Array.isArray(items) && items[0]?.error) {
      return res.status(400).json({ error: items[0].error });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No valid items found in voice input." });
    }

    let TotalAmount = 0;
    const ProcessItems = [];

    for (const item of items) {
      if (!item.product || !item.quantity || !item.mrp) continue;

      const cleanedRate = parseFloat(item.mrp.toString().replace(/[^\d.]/g, ""));
      TotalAmount += cleanedRate;

      ProcessItems.push({
        productName: item.product,
        quantity: item.quantity,
        rate: cleanedRate,
      });
    }

    if (ProcessItems.length === 0) {
      return res.status(400).json({ error: "No valid product items extracted." });
    }

const latestEntry = await ProductSchema.findOne({
  shopkeeperId,
  customerId,
  month: monthName
}).sort({ updatedAt: -1 });

let updatedEntry;

if (!latestEntry) {

  updatedEntry = await ProductSchema.create({
    shopkeeperId,
    customerId,
    month: monthName,
    items: ProcessItems,
    totalAmount: TotalAmount,
    status: "Unpaid",
  });
} else {
  const timeDiff = (Date.now() - latestEntry.updatedAt.getTime()) / 1000; // in seconds

  if (timeDiff <= 10) {
    updatedEntry = await ProductSchema.findByIdAndUpdate(
      latestEntry._id,
      {
        $push: { items: { $each: ProcessItems } },
        $inc: { totalAmount: TotalAmount },
      },
      { new: true }
    );
  } else {
    updatedEntry = await ProductSchema.create({
      shopkeeperId,
      customerId,
      month: monthName,
      items: ProcessItems,
      totalAmount: TotalAmount,
      status: "Unpaid",
    });
  }
}

res.status(201).json({
  message: "Voice-based product entry saved successfully!",
  data: updatedEntry,
});


} catch (err) {
    console.error("Voice Process Error:", err.message);
    res.status(500).json({ error: "Something went wrong while processing voice." });
  }
});

export default router;
