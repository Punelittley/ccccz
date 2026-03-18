import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { Book } from "../../types";
import { toast } from "sonner";

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<Omit<Book, "id">>({
    title: "",
    author: "",
    cover: "",
    description: "",
    pdfUrl: "",
    genre: "",
    discussionDeadline: null
  });

  const genres = [
    "Модерация",
    "Фасилитация",
    "Тренинги",
    "Лекции",
    "Игропрактики",
    "Другое",
  ];

  const isValidAuthor = (value: string) => {
    // only letters (Cyrillic + Latin) and spaces
    return /^[а-яА-ЯёЁa-zA-Z\s]*$/.test(value);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    const token = localStorage.getItem("token");
    fetch("/api/books", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data: Book[]) => setBooks(data))
      .catch((err) => console.error("failed to load books", err));
  };

  const handleSaveBook = () => {
    if (!formData.title || !formData.author) {
      toast.error("Заполните обязательные поля: название и автор");
      return;
    }

    if (formData.title.length > 80) {
      toast.error("Название не должно превышать 80 символов");
      return;
    }

    if (formData.author.length > 80) {
      toast.error("Автор не должен превышать 80 символов");
      return;
    }

    if (!isValidAuthor(formData.author)) {
      toast.error("Автор должен содержать только буквы");
      return;
    }

    if (!genres.includes(formData.genre)) {
      toast.error("Выберите жанр из списка");
      return;
    }

    if (formData.description.length > 300) {
      toast.error("Описание не должно превышать 300 символов");
      return;
    }

    let updatedBooks: Book[];

    if (editingBook) {
      // send PUT to server
      const token = localStorage.getItem("token");
      fetch(`/api/books/${editingBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      }).then(() => {
        toast.success("Книга успешно обновлена");
        loadBooks();
        closeDialog();
      });
    } else {
      const token = localStorage.getItem("token");
      fetch(`/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      })
        .then((r) => r.json())
        .then((newBook: Book) => {
          const nb = { ...newBook, id: newBook.id.toString() };
          toast.success("Книга успешно добавлена");
          setBooks([...books, nb]);
          closeDialog();
        });
    }
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту книгу?")) {
      const token = localStorage.getItem("token");
      fetch(`/api/books/${bookId}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(() => {
        setBooks(books.filter(book => book.id !== bookId));
        toast.success("Книга успешно удалена");
      });
    }
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      cover: book.cover,
      description: book.description,
      pdfUrl: book.pdfUrl,
      genre: book.genre,
      discussionDeadline: book.discussionDeadline || null
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      cover: "",
      description: "",
      pdfUrl: "",
      genre: "",
      discussionDeadline: null
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      cover: "",
      description: "",
      pdfUrl: "",
      genre: ""
    });
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Управление книгами</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus style={{ width: 16, height: 16, marginRight: 8 }} />
                Добавить книгу
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-y-auto" style={{ maxWidth: "42rem", maxHeight: "90vh" }}>
              <DialogHeader>
                <DialogTitle>
                  {editingBook ? "Редактировать книгу" : "Добавить новую книгу"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Название *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Введите название книги"
                    maxLength={80}
                  />
                </div>
                <div>
                  <Label htmlFor="author">Автор *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isValidAuthor(value) || value === "") {
                        setFormData({ ...formData, author: value });
                      }
                    }}
                    placeholder="Введите имя автора"
                    maxLength={80}
                  />
                </div>
                <div>
                  <Label htmlFor="genre">Жанр</Label>
                  <select
                    id="genre"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  >
                    <option value="">Выберите жанр</option>
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="cover">URL обложки</Label>
                  <Input
                    id="cover"
                    value={formData.cover}
                    onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Краткое описание книги"
                    rows={4}
                    maxLength={300}
                  />
                </div>
                <div>
                  <Label htmlFor="pdfUrl">URL PDF файла</Label>
                  <Input
                    id="pdfUrl"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    placeholder="https://example.com/book.pdf"
                  />
                </div>
                <div>
                  <Label htmlFor="discussionDeadline">Дедлайн обсуждения</Label>
                  <Input
                    id="discussionDeadline"
                    type="datetime-local"
                    value={formData.discussionDeadline || ""}
                    onChange={(e) => setFormData({ ...formData, discussionDeadline: e.target.value || null })}
                    placeholder="Дата и время окончания обсуждения"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Отмена
                </Button>
                <Button onClick={handleSaveBook}>
                  {editingBook ? "Сохранить изменения" : "Добавить книгу"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список книг ({books.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Обложка</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Автор</TableHead>
                  <TableHead>Жанр</TableHead>
                  <TableHead>Дедлайн</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.genre}</TableCell>
                    <TableCell>
                      {book.discussionDeadline
                        ? new Date(book.discussionDeadline).toLocaleString("ru-RU")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(book)}
                        >
                          <Pencil style={{ width: 16, height: 16 }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          <Trash2 style={{ width: 16, height: 16, color: "var(--destructive)" }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
