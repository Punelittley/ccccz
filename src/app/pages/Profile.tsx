import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { getUserQuotes } from "../data/quotes";
import type { Book } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BookOpen, Quote, User, LogOut } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { useState, useEffect } from "react";

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editLogin, setEditLogin] = useState("");
  const [editOldPassword, setEditOldPassword] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [editError, setEditError] = useState("");

  const isValidName = (name: string) => {
    // only letters (Cyrillic + Latin)
    return /^[а-яА-ЯёЁa-zA-Z]*$/.test(name);
  };

  const resetEditState = () => {
    setEditEmail(user?.email || "");
    setEditFirstName(user?.firstName || "");
    setEditLastName(user?.lastName || "");
    setEditLogin(user?.login || "");
    setEditOldPassword("");
    setEditPassword("");
    setEditPasswordConfirm("");
    setEditError("");
  };

  // reset edit fields when user changes
  useEffect(() => {
    resetEditState();
  }, [user]);

  // redirect logic for special cases
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetch("/api/books")
      .then(r => r.json())
      .then((bks: Book[]) => {
        const normalized = bks.map(b => ({ ...b, id: b.id.toString() }));
        setBooks(normalized);
      })
      .catch(err => {
        console.error("failed to load books", err);
      });
  }, []);

  if (!user) {
    return null;
  }

  const readingBooks = books.filter((book) => user.readingBooks.includes(book.id));
  const [userQuotes, setUserQuotes] = useState<typeof user.readingBooks>([] as any);

  useEffect(() => {
    getUserQuotes(user.id).then((q) => setUserQuotes(q));
  }, [user.id]);

  // Группируем цитаты по книгам
  const quotesByBook = userQuotes.reduce((acc, quote) => {
    if (!acc[quote.bookId]) {
      acc[quote.bookId] = [];
    }
    acc[quote.bookId].push(quote);
    return acc;
  }, {} as Record<string, typeof userQuotes>);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSave = async () => {
    setEditError("");

    // Validate required fields are not empty
    if (!editEmail.trim()) {
      setEditError("Email не может быть пустым");
      return;
    }
    if (!editLogin.trim()) {
      setEditError("Логин не может быть пустым");
      return;
    }
    if (!editFirstName.trim()) {
      setEditError("Имя не может быть пустым");
      return;
    }
    if (!editLastName.trim()) {
      setEditError("Фамилия не может быть пустой");
      return;
    }

    if (editEmail.length > 20) {
      setEditError("Email не должен превышать 20 символов");
      return;
    }
    if (editLogin.length > 15) {
      setEditError("Логин не должен превышать 15 символов");
      return;
    }
    if (editFirstName.length > 15) {
      setEditError("Имя не должно превышать 15 символов");
      return;
    }
    if (!isValidName(editFirstName)) {
      setEditError("Имя должно содержать только буквы");
      return;
    }
    if (editLastName.length > 15) {
      setEditError("Фамилия не должна превышать 15 символов");
      return;
    }
    if (!isValidName(editLastName)) {
      setEditError("Фамилия должна содержать только буквы");
      return;
    }

    // Password validation
    if (editPassword && !editOldPassword) {
      setEditError("Укажите текущий пароль для смены пароля");
      return;
    }

    if (editPassword && editPassword.length > 15) {
      setEditError("Пароль не должен превышать 15 символов");
      return;
    }

    if (editPassword && editPassword !== editPasswordConfirm) {
      setEditError("Новые пароли не совпадают");
      return;
    }

    const result = await updateProfile({
      email: editEmail,
      firstName: editFirstName,
      lastName: editLastName,
      login: editLogin,
      oldPassword: editOldPassword || undefined,
      password: editPassword || undefined,
    });

    if (!result.success) {
      setEditError(result.error || "Не удалось сохранить изменения");
      return;
    }

    setIsEditOpen(false);
    resetEditState();
  };

  return (
    <div className="app-page">
      <header className="border-b">
        <div className="app-container-narrow px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")}>← Главная</Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut style={{ width: 16, height: 16 }} />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="app-container-narrow px-4 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
                  <User style={{ width: 32, height: 32, color: "var(--primary-foreground)" }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-muted">@{user.login}</p>
                  <p className="text-sm text-muted">{user.email}</p>
                </div>
              </div>

              <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (open) {
                  resetEditState();
                } else {
                  setEditError("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="secondary">Редактировать</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Редактирование профиля</DialogTitle>
                    <DialogDescription>Измените свои данные и сохраните изменения.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editFirstName">Имя</Label>
                        <Input
                          id="editFirstName"
                          value={editFirstName}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (isValidName(value)) setEditFirstName(value);
                          }}
                          maxLength={15}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editLastName">Фамилия</Label>
                        <Input
                          id="editLastName"
                          value={editLastName}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (isValidName(value)) setEditLastName(value);
                          }}
                          maxLength={15}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEmail">Email</Label>
                      <Input
                        id="editEmail"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editLogin">Логин</Label>
                      <Input
                        id="editLogin"
                        value={editLogin}
                        onChange={(e) => setEditLogin(e.target.value)}
                        maxLength={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editOldPassword">Текущий пароль</Label>
                      <Input
                        id="editOldPassword"
                        type="password"
                        value={editOldPassword}
                        onChange={(e) => setEditOldPassword(e.target.value)}
                        maxLength={15}
                        placeholder="Обязательно, если меняете пароль"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPassword">Новый пароль</Label>
                      <Input
                        id="editPassword"
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        maxLength={15}
                        placeholder="Оставьте пустым, чтобы не менять"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPasswordConfirm">Подтверждение пароля</Label>
                      <Input
                        id="editPasswordConfirm"
                        type="password"
                        value={editPasswordConfirm}
                        onChange={(e) => setEditPasswordConfirm(e.target.value)}
                        maxLength={15}
                        placeholder="Повторите новый пароль"
                      />
                    </div>
                    {editError && (
                      <div className="text-sm text-destructive">{editError}</div>
                    )}
                  </div>

                  <DialogFooter className="flex gap-2">
                    <Button className="w-full" onClick={handleSave}>
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsEditOpen(false)}
                    >
                      Отмена
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary-muted">
                  <BookOpen style={{ width: 24, height: 24, color: "var(--primary)" }} />
                </div>
                <div>
                  <p className="text-3xl font-bold">{readingBooks.length}</p>
                  <p className="text-sm text-muted">Книг в чтении</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary-muted">
                  <Quote style={{ width: 24, height: 24, color: "var(--primary)" }} />
                </div>
                <div>
                  <p className="text-3xl font-bold">{userQuotes.length}</p>
                  <p className="text-sm text-muted">Цитат сохранено</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="books">Мои книги</TabsTrigger>
            <TabsTrigger value="quotes">Мои цитаты</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            {readingBooks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted" />
                    <p className="text-muted mb-4">
                      Вы ещё не добавили книги в список для чтения
                    </p>
                    <Button onClick={() => navigate("/")}>
                      Посмотреть каталог
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {readingBooks.map((book) => (
                  <Card
                    key={book.id}
                    className="overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/book/${book.id}`)}
                  >
                    <div className="aspect-book">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-base mb-1">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted">
                        {book.author}
                      </p>
                      {quotesByBook[book.id] && (
                        <p className="text-xs text-primary mt-2">
                          {quotesByBook[book.id].length} цитат
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-6">
            {userQuotes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Quote className="w-12 h-12 mx-auto mb-4 text-muted" />
                    <p className="text-muted">
                      У вас пока нет сохранённых цитат
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              Object.entries(quotesByBook).map(([bookId, quotes]) => {
                const book = books.find((b) => b.id === bookId);
                if (!book) return null;

                return (
                  <div key={bookId}>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold">{book.title}</h3>
                      <span className="text-sm text-muted">
                        ({quotes.length})
                      </span>
                    </div>
                    <div className="space-y-3 mb-8">
                      {quotes.map((quote) => (
                        <Card key={quote.id} className="border-l-4 border-primary">
                          <CardContent className="pt-4">
                            <blockquote className="text-sm italic border-l-2 border-muted pl-4 py-2">
                              "{quote.text}"
                            </blockquote>
                            <p className="text-xs text-muted mt-3">
                              {new Date(quote.date).toLocaleDateString('ru-RU')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Separator />
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
