// shared TypeScript interfaces for domain objects

export interface Book {
  id: string;
  title: string;
  author?: string;
  cover?: string;
  description?: string;
  pdfUrl?: string;
  genre?: string;
  discussionDeadline?: string | null;
}

export interface Comment {
  id: string;
  bookId: string;
  author: string;
  text: string;
  date: string;
}

export interface Quote {
  id: string;
  bookId: string;
  userId?: string;
  userName?: string;
  text: string;
  date: string;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
  };
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  gallery: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  }>;
  booksSection: {
    title: string;
    description: string;
  };
  footer?: {
    text: string;
  };
}
