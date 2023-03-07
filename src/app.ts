import express from "express";
import routes from "./routes/routes";
import { corsMiddleware } from "./middleware/cors";

const app = express();

app.use(express.json());

// Apply the CORS middleware to all incoming requests
app.use(corsMiddleware);

// Use routes
app.use("/", routes);

export default app;
