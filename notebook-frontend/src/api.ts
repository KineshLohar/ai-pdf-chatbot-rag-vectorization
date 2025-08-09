import axios from "axios"

export const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "Unable to fetch backend url", // Change when deploying
  headers: {
    "Content-Type": "application/json"
  }
})