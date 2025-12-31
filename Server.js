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

const allowedOrigins = [
  "http://localhost:5173",
  "https://nolekh.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);




app.use("/shop", shopkeeper);
app.use("/User", customer);

const PORT = process.env.PORT || 4000;
app.listen(PORT,() =>
  console.log("server started:- " + PORT)
);
