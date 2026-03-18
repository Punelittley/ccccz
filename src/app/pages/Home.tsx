import { BookCard } from "../components/BookCard";
import { BookOpen, Users, MessageCircle, User, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import type { Book, SiteContent } from "../types";


export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  useEffect(() => {
    // load books and site content from the API; if the server is unreachable we simply leave arrays empty
    fetch("/api/books")
      .then((r) => r.json())
      .then((data: Book[]) => {
        const normalized = data.map(b => ({ ...b, id: b.id.toString() }));
        setBooks(normalized);
      })
      .catch(() => {
        console.error("failed to load books from API");
      });

    fetch("/api/content")
      .then(r => {
        if (!r.ok) throw new Error(`content fetch failed ${r.status}`);
        return r.json();
      })
      .then((data: SiteContent) => setContent(data))
      .catch((err) => {
        console.error("failed to load site content from API", err);
      });
  }, []);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      BookOpen,
      Users,
      MessageCircle
    };
    return icons[iconName] || BookOpen;
  };

  return (
    <div className="app-page">
      
      <nav className="nav-absolute">
        <div className="app-container flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <img src="./Почерк.svg" alt="" />
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/admin")}
                    style={{ color: "white" }}
                  >
                    <Settings style={{ width: 16, height: 16, marginRight: 8 }} />
                    Админ-панель
                  </Button>
                )}
                {user.role !== "admin" && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/profile")}
                    style={{ color: "white" }}
                  >
                    <User style={{ width: 16, height: 16, marginRight: 8 }} />
                    {user.firstName}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} style={{ color: "white" }}>
                  Войти
                </Button>
                <Button variant="secondary" onClick={() => navigate("/register")}>
                  Регистрация
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-bg">
          <img
            src={content?.hero?.imageUrl || "https://images.unsplash.com/photo-1709855256067-12ad9a64ac06?w=1080"}
            alt="Уютное чтение"
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <h1 className="font-bold mb-6" style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}>
            {content?.hero?.title || "Почерк"}
          </h1>
          <p className="mb-8" style={{ fontSize: "1.25rem" }}>
            {content?.hero?.subtitle || "Читаем вместе, обсуждаем с удовольствием"}
          </p>
          <p style={{ fontSize: "1.125rem", opacity: 0.9 }}>
            {content?.hero?.description || "Присоединяйтесь к сообществу любителей литературы"}
          </p>
        </div>
      </section>

      <section className="section section-muted">
        <div className="app-container">
          <div className="grid gap-8 md:grid-cols-3">
            {(content?.features || [
              { id: "1", title: "Разнообразие жанров", description: "От классики до современной литературы — каждый найдёт книгу по душе", icon: "1" },
              { id: "2", title: "Дружное сообщество", description: "Общайтесь с единомышленниками и делитесь впечатлениями", icon: "Users" },
              { id: "3", title: "Живые обсуждения", description: "Обсуждайте сюжет, персонажей и делитесь своими мыслями", icon: "MessageCircle" }
            ]).map((feature) => {
              const Icon = getIconComponent(feature.icon);
              return (
                <div key={feature.id} className="text-center">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
                  >
                    <Icon style={{ width: 32, height: 32, color: "var(--primary)" }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="app-container">
          <h2 className="text-3xl font-bold text-center mb-12">Погрузитесь в мир литературы</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {(content?.gallery || [
              { id: "1", title: "Ваша личная библиотека", description: "Доступ к электронным версиям книг", imageUrl: "https://images.unsplash.com/photo-1763616828336-e7fcd02086f5?w=1080" },
              { id: "2", title: "Читайте вместе с нами", description: "Еженедельные встречи и обсуждения", imageUrl: "https://images.unsplash.com/photo-1713942590283-59867d5e3f8d?w=1080" }
            ]).map((item) => (
              <div key={item.id} className="relative rounded-lg overflow-hidden" style={{ height: 300 }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-6"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                >
                  <div className="text-white">
                    <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                    <p style={{ opacity: 0.9 }}>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="app-container">
          <h2 className="text-3xl font-bold text-center mb-4">
            {content?.booksSection?.title || "Наши книги"}
          </h2>
          <p className="text-center text-muted mb-12 max-w-2xl mx-auto">
            {content?.booksSection?.description || "Выберите книгу и присоединяйтесь к обсуждению. Делитесь мнениями, задавайте вопросы и находите новых друзей!"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* <footer className="py-8 px-4 border-t">
        <div className="app-container text-center text-muted">
          <p>{content?.footer?.text || "© 2026 Книжный Клуб. Читайте с удовольствием!"}</p>
        </div>
      </footer> */}
    </div>
  );
}
