import { useState, useEffect } from "react";
import type { Comment } from "../types";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface CommentSectionProps {
  bookId: string;
  discussionDeadline?: string | null;
}

export function CommentSection({ bookId, initialComments = [], discussionDeadline }: CommentSectionProps) {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetch(`/api/books/${bookId}/comments`)
      .then((r) => r.json())
      .then((data: Comment[]) => setComments(data))
      .catch((err) => {
        console.error("failed to load comments", err);
      });
  }, [bookId]);

  const [author, setAuthor] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [text, setText] = useState("");

  useEffect(() => {
    if (user) {
      setAuthor(`${user.firstName} ${user.lastName}`);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const commentAuthor = user
      ? `${user.firstName} ${user.lastName}`
      : author.trim();

    if (!commentAuthor || !text.trim()) {
      return;
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      bookId,
      author: commentAuthor,
      text: text.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [...comments, newComment];
    setComments(updated);
    if (!user) {
      setAuthor("");
    }
    setText("");

    fetch(`/api/books/${bookId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        text: newComment.text,
        authorName: user ? undefined : author.trim()
      }),
    }).catch(console.error);
  };

  const now = new Date();
  const deadlineDate = discussionDeadline ? new Date(discussionDeadline) : null;
  const isExpired = deadlineDate ? now > deadlineDate : false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Обсуждение ({comments.length})
        </h2>
        {discussionDeadline && (
          <p className="text-sm text-muted mb-2">
            Дедлайн для комментариев: {new Date(discussionDeadline).toLocaleString("ru-RU")}
          </p>
        )}
        <div className="space-y-4 mb-8">
          {comments.length === 0 ? (
            <p className="text-muted">
              Пока нет комментариев. Станьте первым, кто поделится мнением!
            </p>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{comment.author}</CardTitle>
                    <span className="text-sm text-muted">
                      {new Date(comment.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{comment.text}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Оставить комментарий</CardTitle>
        </CardHeader>
        <CardContent>
          {isExpired ? (
            <p className="text-center text-destructive">
              Дедлайн обсуждения истёк, комментарии больше недоступны.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!user && (
                <div>
                  <label htmlFor="author" className="block text-sm font-medium mb-2">
                    Ваше имя
                  </label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>
              )}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2">
                  Комментарий
                </label>
                <Textarea
                  id="comment"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Поделитесь своими мыслями о книге..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Отправить комментарий
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
