import type { Quote } from "../types";

export type { Quote };

// utility to fetch quotes by book from backend
export async function getQuotes(bookId?: string): Promise<Quote[]> {
  if (!bookId) return [];
  const res = await fetch(`/api/books/${bookId}/quotes`);
  return res.ok ? res.json() : [];
}

// fetch quotes of a user (requires auth)
export async function getUserQuotes(userId: string, bookId?: string): Promise<Quote[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/users/${userId}/quotes`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) return [];
  let quotes: Quote[] = await res.json();
  if (bookId) {
    quotes = quotes.filter(q => q.bookId === bookId);
  }
  return quotes;
}

export async function addQuote(quote: Omit<Quote, "id" | "date" | "userName">): Promise<void> {
  const token = localStorage.getItem("token");
  await fetch(`/api/books/${quote.bookId}/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ text: quote.text })
  });
}

export async function deleteQuote(quoteId: string): Promise<void> {
  const token = localStorage.getItem("token");
  await fetch(`/api/quotes/${quoteId}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}
