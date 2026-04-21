import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import feedbackRouter from "./routes/feedback.routes.js";

import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js";

const app = express();
// socket io
const server = http.createServer(app);

const io = new Server(server, {
  cors:{
  origin:"http://localhost:5173",
  credentials:true,
  methods:["POST", "GET"]
}
})

app.set("io", io)

const port = process.env.PORT || 5000;

// ⭐ ADD THIS (VERY IMPORTANT)
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});


// konse local sever connect kar sakte hai 
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))
// global routes convert in json//
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter)
app.use("/api/feedback", feedbackRouter)

// socket io handler // comes from socket.js
socketHandler(io)

server.listen(port, ()=>{
    connectDb();
    console.log(`sever started at ${port}`);
    
})