import { useEffect, useState } from 'react';

import './BookCover.css';

interface BookCoverProps {
  coverImageUrl?: string | null;
  title: string;
  author?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function BookCover({
  coverImageUrl,
  title,
  author = '',
  imageClassName = 'book-cover-image',
  fallbackClassName = '',
}: BookCoverProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const url = coverImageUrl?.trim();

  useEffect(() => {
    setImageFailed(false);
  }, [url]);

  const showFallback = !url || imageFailed;

  if (showFallback) {
    return (
      <div
        className={`book-cover-fallback ${fallbackClassName}`.trim()}
        role="img"
        aria-label={author ? `${title}, ${author}` : title}
      >
        <div className="book-cover-fallback-frame" aria-hidden="true" />
        <div className="book-cover-fallback-inner">
          <p className="book-cover-fallback-title">{title}</p>
          {author ? <p className="book-cover-fallback-author">{author}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`Naslovna: ${title}`}
      className={`book-cover-image ${imageClassName}`.trim()}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  );
}
