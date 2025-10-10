const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/memberRoutes");

const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// Swagger docs
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
