import type { Book } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useNavigate } from "react-router";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <div className="aspect-book">
        <img src={book.cover} alt={book.title} />
      </div>
      <CardContent className="pt-4">
        <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
        <p className="text-sm text-muted mb-2">{book.author}</p>
        <p className="text-xs text-muted">{book.genre}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate(`/book/${book.id}`)} className="w-full">
          Перейти к обсуждению
        </Button>
      </CardFooter>
    </Card>
  );
}
