import express from "express";
import cors from "cors";
import mongoConnection from "./config/db.js";
import dotenv from "dotenv";
import shopkeeper from "./routes/shopkeeper/index.js";
import customer from "./routes/Customer/index.js";

dotenv.config();
mongoConnection();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use("/shop", shopkeeper);
app.use("/User", customer);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "192.172.149.117", () =>
  console.log("server started:- " + PORT)
);
