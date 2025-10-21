const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const checkUser = require("./middleware/userLoader");

// --- API Routes ---
const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/memberRoutes");
const brandRoutes = require("./routes/brandRoutes");
const perfumeRoutes = require("./routes/perfumeRoutes");
// const commentRoutes = require("./routes/commentRoutes");

// --- WEB Routes (EJS View) ---
const webRoutes = require("./routes/webRoutes");

// --- Swagger ---
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

// Cấu hình môi trường và Database
dotenv.config();
connectDB();

const app = express();

// --- 1. Cấu hình Middleware cơ bản ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(checkUser);

// --- 2. Cấu hình EJS View Engine và Static Files ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// --- 3. Mount API Routes (/api/v1/...) ---
// Swagger docs
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Mount các tuyến API (những tuyến trả về JSON)
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/perfumes", perfumeRoutes);

// --- 4. Mount WEB Routes (Tuyến giao diện người dùng) ---
app.use("/", webRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
