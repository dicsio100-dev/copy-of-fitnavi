import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDOR8Cb_rXmGqkE-1fmr4FCTIVfWCHK3EY");

export const geminiModel = genAI.getGenerativeModel(
    { model: "gemini-1.5-flash" },
    { apiVersion: "v1" }
);