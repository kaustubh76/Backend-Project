import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";   // to access the cookie from my server and sent back the ccokie

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit : "16kb"}))  //nested objects to be use for extended keyword
app.use(express.static("public"))   // to store externally coming file such as photo pdf