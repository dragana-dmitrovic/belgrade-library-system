INSERT IGNORE INTO library_branches (id, name, address, latitude, longitude, phone, email, working_hours) VALUES
(1, 'Biblioteka grada Beograda', 'Knez Mihailova 56', 44.8172, 20.4569, '+381 11 1234567', 'info@bgb.rs', 'Pon–Pet 08:00–20:00, Sub 09:00–17:00'),
(2, 'Ogranak Zemun', 'Glavna 1, Zemun', 44.8458, 20.4017, '+381 11 2345678', 'zemun@bgb.rs', 'Pon–Pet 09:00–19:00'),
(3, 'Ogranak Novi Beograd', 'Bulevar Mihajla Pupina 10v', 44.8150, 20.4340, '+381 11 3456789', 'nbg@bgb.rs', 'Pon–Sub 09:00–20:00'),
(4, 'Ogranak Voždovac', 'Ustanička 185', 44.7820, 20.4780, '+381 11 4567890', 'vozdovac@bgb.rs', 'Pon–Pet 08:30–19:30'),
(5, 'Ogranak Zvezdara', 'Olge Jovanović 16', 44.8050, 20.4880, '+381 11 5678901', 'zvezdara@bgb.rs', 'Pon–Pet 09:00–19:00');

INSERT IGNORE INTO authors (name) VALUES
('Yuval Noah Harari'),
('Bill Bryson'),
('Thomas Kuhn'),
('Lav Tolstoj'),
('J. R. R. Tolkien'),
('Agata Kristi'),
('Walter Isaacson'),
('D. M. Barri'),
('Antoan de Sent Egziperi');

INSERT IGNORE INTO books (id, title, author_id, isbn, genre, description, cover_image_url, total_copies, available_copies)
SELECT 4, 'Sapiens', a.id, '9780062316110', 'NON_FICTION', 'Kratka istorija čovečanstva.', NULL, 6, 4
FROM authors a WHERE a.name = 'Yuval Noah Harari'
UNION ALL
SELECT 5, 'Kratka istorija skoro svega', a.id, '9780767908184', 'SCIENCE', 'Pristupačan uvod u nauku.', NULL, 5, 5
FROM authors a WHERE a.name = 'Bill Bryson'
UNION ALL
SELECT 6, 'Struktura naučnih revolucija', a.id, '9780226458083', 'SCIENCE', 'Klasična filozofija nauke.', NULL, 2, 2
FROM authors a WHERE a.name = 'Thomas Kuhn'
UNION ALL
SELECT 7, 'Ana Karenjina', a.id, '9780140449174', 'ROMANCE', 'Veliki ruski roman o ljubavi i društvu.', NULL, 4, 3
FROM authors a WHERE a.name = 'Lav Tolstoj'
UNION ALL
SELECT 8, 'Gospodar prstenova', a.id, '9780544003415', 'FICTION', 'Epska fantastika Srednje zemlje.', NULL, 8, 6
FROM authors a WHERE a.name = 'J. R. R. Tolkien'
UNION ALL
SELECT 9, 'Ubistvo u Orijent ekspresu', a.id, '9780062693662', 'MYSTERY', 'Poirot rešava zagonetku u vozu.', NULL, 5, 4
FROM authors a WHERE a.name = 'Agata Kristi'
UNION ALL
SELECT 11, 'Steve Jobs', a.id, '9781451648539', 'BIOGRAPHY', 'Biografija suosnivača Apple-a.', NULL, 4, 3
FROM authors a WHERE a.name = 'Walter Isaacson'
UNION ALL
SELECT 13, 'Petar Pan', a.id, '9780142437933', 'CHILDREN', 'Avantura dečaka koji ne želi da odraste.', NULL, 6, 5
FROM authors a WHERE a.name = 'D. M. Barri'
UNION ALL
SELECT 14, 'Mali princ', a.id, '9780156012195', 'CHILDREN', 'Čuvena priča o prijateljstvu.', NULL, 10, 8
FROM authors a WHERE a.name = 'Antoan de Sent Egziperi';

INSERT IGNORE INTO users (id, email, password, created_at) VALUES
(1, 'admin@beolib.rs', '$2b$10$5kwTaZh4/6bUwsNN2nFdg.S11M0yjRzFz15LHcXMobSYb/CJW5Zge', NOW()),
(2, 'user1@beolib.rs', '$2b$10$xZLkPDUPhqyPywj.FDAqfui.Y6D3kSBLgCuB7keFC450ICsmMpnVO', NOW()),
(3, 'user2@beolib.rs', '$2b$10$2F0AV6q3ADyboLsv3JyssevbiAkFIHdcrJ8CtNOkP36CzIyvsTW76', NOW());

INSERT IGNORE INTO librarians (user_id, first_name, last_name) VALUES
(1, 'Admin', 'BeoLib');

INSERT IGNORE INTO members (user_id, first_name, last_name) VALUES
(2, 'Marko', 'Petrović'),
(3, 'Ana', 'Jovanović');

-- Migriraj stare status vrednosti rezervacija (PENDING/APPROVED/RETURNED iz starog modela).
UPDATE reservations SET status = 'ACTIVE' WHERE status IN ('PENDING', 'APPROVED');
UPDATE reservations SET status = 'PICKED_UP' WHERE status = 'RETURNED';
UPDATE reservations SET status = 'CANCELLED' WHERE status IS NULL OR status = '';

-- Direktna pozajmica ne mora imati reservation_id (Loan može nastati bez rezervacije).
ALTER TABLE loans MODIFY COLUMN reservation_id BIGINT NULL;

-- Neravnomerna podela inventara po filijalama (suma po knjizi = books.total/available_copies)
INSERT IGNORE INTO branch_book_inventory (id, book_id, branch_id, total_copies, available_copies, version) VALUES
-- Knjiga 4: total=6, available=4
(11, 4, 1, 2, 2, 0),
(12, 4, 2, 1, 1, 0),
(13, 4, 3, 1, 0, 0),
(14, 4, 4, 1, 1, 0),
(15, 4, 5, 1, 0, 0),
-- Knjiga 5: total=5, available=5
(16, 5, 1, 2, 2, 0),
(17, 5, 2, 1, 1, 0),
(18, 5, 3, 1, 1, 0),
(19, 5, 4, 1, 1, 0),
-- Knjiga 6: total=2, available=2
(20, 6, 1, 1, 1, 0),
(21, 6, 2, 1, 1, 0),
-- Knjiga 7: total=4, available=3
(22, 7, 1, 2, 2, 0),
(23, 7, 2, 1, 1, 0),
(24, 7, 3, 1, 0, 0),
-- Knjiga 8: total=8, available=6
(25, 8, 1, 3, 2, 0),
(26, 8, 2, 2, 2, 0),
(27, 8, 3, 1, 0, 0),
(28, 8, 4, 1, 1, 0),
(29, 8, 5, 1, 1, 0),
-- Knjiga 9: total=5, available=4
(30, 9, 1, 2, 2, 0),
(31, 9, 2, 1, 1, 0),
(32, 9, 3, 1, 0, 0),
(33, 9, 4, 1, 1, 0),
-- Knjiga 11: total=4, available=3
(37, 11, 1, 2, 2, 0),
(38, 11, 2, 1, 0, 0),
(39, 11, 3, 1, 1, 0),
-- Knjiga 13: total=6, available=5
(42, 13, 1, 2, 2, 0),
(43, 13, 2, 1, 1, 0),
(44, 13, 3, 1, 1, 0),
(45, 13, 4, 1, 1, 0),
(46, 13, 5, 1, 0, 0),
-- Knjiga 14: total=10, available=8
(47, 14, 1, 4, 3, 0),
(48, 14, 2, 2, 2, 0),
(49, 14, 3, 2, 1, 0),
(50, 14, 4, 1, 1, 0),
(51, 14, 5, 1, 1, 0);

CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
