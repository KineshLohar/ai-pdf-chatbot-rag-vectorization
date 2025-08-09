import axios from "axios"

export const instance = axios.create({
  baseURL: process.env.VITE_BACKEND_URL || "http://localhost:5000/api", // Change when deploying
  headers: {
    "Content-Type": "application/json"
  }
})