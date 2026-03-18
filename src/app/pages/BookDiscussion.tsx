import { useParams, useNavigate } from "react-router";
import { CommentSection } from "../components/CommentSection";
import { Button } from "../components/ui/button";
import { ArrowLeft, Download, BookOpen } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { BookReader } from "../components/BookReader";
import { QuoteSection } from "../components/QuoteSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import type { Book } from "../types";

export default function BookDiscussion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const { user, addBookToReading, removeBookFromReading, isBookInReading } = useAuth();

  // если админ попытается открыть обсуждение, отправим его на панель
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);
  const [quoteRefresh, setQuoteRefresh] = useState(0);

  useEffect(() => {
    // load books from backend; if fetch fails we will just leave books empty
    fetch("/api/books")
      .then(r => r.json())
      .then((loadedBooks: Book[]) => {
        // ensure id is a string everywhere – the server returns numbers
        const normalized = loadedBooks.map(b => ({ ...b, id: b.id.toString() }));
        setBooks(normalized);
        const currentBook = normalized.find((b) => b.id === id);
        setBook(currentBook || null);
      })
      .catch((err) => {
        console.error("failed to load books", err);
      });
  }, [id]);

  if (!book) {
    return (
      <div className="app-page flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Книга не найдена</h1>
          <Button onClick={() => navigate("/")}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <header className="border-b sticky top-0 z-10" style={{ background: "var(--background)" }}>
        <div className="app-container-narrow px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft style={{ width: 16, height: 16 }} />
              Назад к книгам
            </Button>
            {user && (
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Личный кабинет
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="app-container-narrow px-4 py-8">
        <div className="grid gap-8 mb-12 md:grid-cols-[300px_1fr]">
          <div>
            <div className="sticky" style={{ top: "6rem" }}>
              <img src={book.cover} alt={book.title} className="w-full rounded-lg" style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
              {user && (
                <Button
                  className="w-full mt-4"
                  variant={isBookInReading(book.id) ? "outline" : "default"}
                  onClick={() => {
                    if (isBookInReading(book.id)) {
                      removeBookFromReading(book.id);
                    } else {
                      addBookToReading(book.id);
                    }
                  }}
                >
                  {isBookInReading(book.id) ? "Убрать из чтения" : "Добавить в чтение"}
                </Button>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div>
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-sm rounded-full mb-3 bg-primary-muted text-primary">
                {book.genre}
              </span>
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted mb-6">{book.author}</p>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-3">О книге</h2>
                <p className="text-muted leading-relaxed">{book.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-3">
                  Электронная версия
                </h2>
                <p className="text-sm text-muted mb-4">
                  Скачайте книгу в формате PDF для чтения на любом устройстве
                </p>
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    // В реальном приложении здесь была бы ссылка на скачивание файла
                  }}
                >
                  <Download style={{ width: 16, height: 16 }} />
                  Скачать PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for Reading, Quotes and Comments */}
        <Tabs defaultValue="read" className="border-t pt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="read">Читать</TabsTrigger>
            <TabsTrigger value="quotes">Цитаты</TabsTrigger>
            <TabsTrigger value="comments">Обсуждение</TabsTrigger>
          </TabsList>

          <TabsContent value="read" className="mt-6">
            <BookReader book={book} onQuoteAdded={() => setQuoteRefresh(prev => prev + 1)} />
          </TabsContent>

          <TabsContent value="quotes" className="mt-6">
            <QuoteSection bookId={book.id} refresh={quoteRefresh} />
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <CommentSection
              bookId={book.id}
              discussionDeadline={book.discussionDeadline}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer
      <footer className="py-8 px-4 border-t mt-12">
        <div className="app-container-narrow text-center text-muted">
          <p>© 2026 Книжный Клуб. Читайте с удовольствием!</p>
        </div>
      </footer> */}
    </div>
  );
}