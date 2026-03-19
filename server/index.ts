import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path"; // Перенеси сюда
import { fileURLToPath } from "url"; // Перенеси сюда
import { initDb, User, Role, Book, Comment, Quote, SiteContent } from "./models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

app.use(cors());
app.use(bodyParser.json());

interface JwtPayload {
  id: number;
  login: string;
  role: string;
}

function authMiddleware(req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] as string;
  console.log("Auth Header:", authHeader ? "Present" : "Missing");
  
  if (authHeader) {
    const parts = authHeader.split(" ");
    console.log("Auth Header Parts:", parts.length, parts[0]);
    
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.error("Invalid auth header format");
      return res.status(401).json({ success: false, error: "Invalid auth header format" });
    }
    
    const token = parts[1];
    console.log("Token received, length:", token.length);
    
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.error("JWT verification error:", err.message, "Token type:", typeof token);
        return res.status(403).json({ success: false, error: `Auth failed: ${err.message}` });
      }
      console.log("JWT verified. User ID:", user.id, "Role:", user.role);
      req.user = user as JwtPayload;
      next();
    });
  } else {
    console.error("No authorization header provided");
    res.status(401).json({ success: false, error: "No authorization header" });
  }
}

app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { email, firstName, lastName, login, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const userRole = await Role.findOne({ where: { name: "user" } });
    const newUser = await User.create({
      email,
      firstName,
      lastName,
      login,
      password: hash,
      RoleId: userRole?.id,
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { login, password } = req.body;

  const { Op } = await import("sequelize");
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { login },
        { email: login }
      ]
    },
    include: [Role, { model: Book, as: 'readingBooks' }]
  }) as any;
  if (!user) return res.status(401).json({ success: false });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ success: false });
  const token = jwt.sign(
    { id: user.id, login: user.login, role: user.Role.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ success: true, token, user: {
    id: user.id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    login: user.login,
    role: user.Role.name,
    readingBooks: user.readingBooks ? user.readingBooks.map((b: any) => b.id.toString()) : []
  }});
});

app.get("/api/stats", async (req: Request, res: Response) => {
  const totalBooks = await Book.count();
  const totalUsers = await User.count();
  const totalComments = await Comment.count();
  const totalQuotes = await Quote.count();
  res.json({ totalBooks, totalUsers, totalComments, totalQuotes });
});

app.get("/api/content", async (req: Request, res: Response) => {
  const content = await SiteContent.findByPk(1);
  res.json(content ? content.data : {});
});

app.put("/api/content", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin") return res.sendStatus(403);
  await SiteContent.update({ data: req.body }, { where: { id: 1 } });
  res.json({ success: true });
});

app.get("/api/users", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin") return res.sendStatus(403);
  const users = await User.findAll({ include: Role }) as any[];
  const result = users.map((u: any) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    login: u.login,
    role: u.Role.name
  }));
  res.json(result);
});

app.post("/api/users", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin") return res.sendStatus(403);
  const { email, firstName, lastName, login, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const roleObj = await Role.findOne({ where: { name: role } });
  await User.create({
    email,
    firstName,
    lastName,
    login,
    password: hash,
    RoleId: roleObj?.id,
  });
  res.json({ success: true });
});

app.put("/api/users/:id", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  const idString = req.params.id;
  const userId = parseInt(idString, 10);

  console.log("PUT /api/users called");
  console.log("URL Param ID:", idString, "parsed:", userId);
  console.log("User from JWT:", req.user?.id, "Type:", typeof req.user?.id);
  console.log("User Role:", req.user?.role);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ success: false, error: "Invalid user id" });
  }

  // Allow admins to update any user, or a user to update their own profile
  const isAdmin = req.user?.role === "admin";
  const isSameUser = req.user?.id === userId;
  
  console.log("Is Admin:", isAdmin, "Is Same User:", isSameUser);
  
  if (!isAdmin && !isSameUser) {
    const errorMsg = `Unauthorized. Admin=${isAdmin}, JWT ID=${req.user?.id}, Param ID=${userId}`;
    console.error(errorMsg);
    return res.status(403).json({ success: false, error: errorMsg });
  }

  const { email, firstName, lastName, login, password, oldPassword, role } = req.body;

  // Validate required fields
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }
  if (!firstName || !firstName.trim()) {
    return res.status(400).json({ success: false, error: "First name is required" });
  }
  if (!lastName || !lastName.trim()) {
    return res.status(400).json({ success: false, error: "Last name is required" });
  }
  if (!login || !login.trim()) {
    return res.status(400).json({ success: false, error: "Login is required" });
  }

  const updates: any = { email, firstName, lastName, login };

  // If password is being updated, verify old password
  if (password) {
    if (!oldPassword) {
      return res.status(400).json({ success: false, error: "Old password required to change password" });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ success: false, error: "Old password is incorrect" });
    }

    updates.password = await bcrypt.hash(password, 10);
  }

  // Only admins can update roles
  if (role && req.user?.role === "admin") {
    const roleObj = await Role.findOne({ where: { name: role } });
    updates.RoleId = roleObj?.id;
  }

  try {
    await User.update(updates, { where: { id: userId } });
    const updatedUser = await User.findByPk(userId, { include: [Role, { model: Book, as: 'readingBooks' }] }) as any;

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const responsePayload: any = {
      success: true,
      user: {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        login: updatedUser.login,
        role: updatedUser.Role.name,
        readingBooks: updatedUser.readingBooks ? updatedUser.readingBooks.map((b: any) => b.id.toString()) : []
      }
    };

    // If the currently authenticated user updated their own account, return an updated token.
    if (isSameUser) {
      const newToken = jwt.sign(
        { id: updatedUser.id, login: updatedUser.login, role: updatedUser.Role.name },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      responsePayload.token = newToken;
    }

    res.json(responsePayload);
  } catch (error: any) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update user" });
  }
});

app.delete("/api/users/:id", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin") return res.sendStatus(403);
  const id = req.params.id;
  await User.destroy({ where: { id } });
  res.json({ success: true });
});

app.get("/api/books", async (req: Request, res: Response) => {
  const books = await Book.findAll();
  res.json(books);
});
app.post("/api/books", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin") return res.sendStatus(403);
  const book = await Book.create(req.body);
  res.json(book);
});
app.put("/api/books/:id", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin") return res.sendStatus(403);
  const id = req.params.id;
  await Book.update(req.body, { where: { id } });
  res.json({ success: true });
});
app.delete("/api/books/:id", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin") return res.sendStatus(403);
  const id = req.params.id;
  await Book.destroy({ where: { id } });
  res.json({ success: true });
});

app.post("/api/users/:userId/reading/:bookId", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin" && req.user?.id !== parseInt(req.params.userId)) {
    return res.sendStatus(403);
  }
  const user = await User.findByPk(req.params.userId as unknown as number) as any;
  const book = await Book.findByPk(req.params.bookId as unknown as number) as any;
  if (user && book) {
    await user.addReadingBook(book);
    res.json({ success: true });
  } else {
    res.sendStatus(404);
  }
});

app.delete("/api/users/:userId/reading/:bookId", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin" && req.user?.id !== parseInt(req.params.userId)) {
    return res.sendStatus(403);
  }
  const user = await User.findByPk(req.params.userId as unknown as number) as any;
  const book = await Book.findByPk(req.params.bookId as unknown as number) as any;
  if (user && book) {
    await user.removeReadingBook(book);
    res.json({ success: true });
  } else {
    res.sendStatus(404);
  }
});

app.get("/api/books/:bookId/comments", async (req: Request, res: Response) => {
  const comments = await Comment.findAll({ where: { bookId: req.params.bookId } });
  res.json(comments);
});
app.post("/api/books/:bookId/comments", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  const { text } = req.body;
  const bookId = req.params.bookId;
  const authorName = req.user ? `${req.user.login}` : req.body.authorName;
  const comment = await Comment.create({
    text,
    date: new Date(),
    bookId: parseInt(bookId),
    authorName,
    userId: req.user?.id,
  });
  res.json(comment);
});

app.get("/api/users/:userId/quotes", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  if (req.user?.role !== "admin" && req.user?.id !== parseInt(req.params.userId)) {
    return res.sendStatus(403);
  }
  const quotes = await Quote.findAll({ where: { userId: req.params.userId } });
  res.json(quotes);
});

app.get("/api/books/:bookId/quotes", async (req: Request, res: Response) => {
  const quotes = await Quote.findAll({ where: { bookId: req.params.bookId } });
  res.json(quotes);
});

app.post("/api/books/:bookId/quotes", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  const { text } = req.body;
  const quote = await Quote.create({
    text,
    date: new Date(),
    bookId: req.params.bookId as unknown as number,
    userId: req.user?.id,
  });
  res.json(quote);
});

app.delete("/api/quotes/:id", authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
  const quote = await Quote.findByPk(req.params.id as unknown as number);
  if (!quote) return res.sendStatus(404);
  if (req.user?.role !== "admin" && quote.userId !== req.user?.id) {
    return res.sendStatus(403);
  }
  await quote.destroy();
  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, "../../dist")));

app.get("*", (req, res) => {
  // Если это запрос к API, который не был найден выше - отдаем 404 JSON, а не HTML
  if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ success: false, error: "API route not found" });
  }
  // Для всего остального отдаем фронтенд
  res.sendFile(path.join(__dirname, "../../dist", "index.html"));
});


initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});