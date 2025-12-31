import { BookCover } from "@/components/books/BookCover";
import { BuyOnAmazon } from "@/components/books/BuyOnAmazon";
import { Link } from "react-router-dom";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url?: string | null;
  purchase_url?: string | null;
  year_published?: number | null;
}

interface BookCardProps {
  book: Book;
  showBuyButton?: boolean;
}

export function BookCard({ book, showBuyButton = true }: BookCardProps) {
  return (
    <div className="group border border-border bg-card overflow-hidden hover:bg-accent/5 transition-colors">
      <Link to={`/library/${book.id}`}>
        <BookCover
          coverUrl={book.cover_url}
          title={book.title}
          yearPublished={book.year_published}
          showYearBadge
          className="w-full"
        />
      </Link>

      <div className="p-3 space-y-2">
        <Link to={`/library/${book.id}`} className="block">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {book.author}
          </p>
        </Link>

        {showBuyButton && (
          <BuyOnAmazon
            bookId={book.id}
            title={book.title}
            author={book.author}
            purchaseUrl={book.purchase_url}
            className="w-full justify-center text-xs py-1.5"
          />
        )}
      </div>
    </div>
  );
}
