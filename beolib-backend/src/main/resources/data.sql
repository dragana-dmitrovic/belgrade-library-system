INSERT IGNORE INTO library_branches (id, name, address, latitude, longitude, phone, email, working_hours) VALUES
(1, 'Biblioteka grada Beograda', 'Knez Mihailova 56', 44.8172, 20.4569, '+381 11 1234567', 'info@bgb.rs', 'Pon–Pet 08:00–20:00, Sub 09:00–17:00'),
(2, 'Ogranak Zemun', 'Glavna 1, Zemun', 44.8458, 20.4017, '+381 11 2345678', 'zemun@bgb.rs', 'Pon–Pet 09:00–19:00'),
(3, 'Ogranak Novi Beograd', 'Bulevar Mihajla Pupina 10v', 44.8150, 20.4340, '+381 11 3456789', 'nbg@bgb.rs', 'Pon–Sub 09:00–20:00'),
(4, 'Ogranak Voždovac', 'Ustanička 185', 44.7820, 20.4780, '+381 11 4567890', 'vozdovac@bgb.rs', 'Pon–Pet 08:30–19:30'),
(5, 'Ogranak Zvezdara', 'Olge Jovanović 16', 44.8050, 20.4880, '+381 11 5678901', 'zvezdara@bgb.rs', 'Pon–Pet 09:00–19:00');

INSERT IGNORE INTO books (id, title, author, isbn, genre, description, cover_image_url, total_copies, available_copies) VALUES
(1, 'Na Drini ćuprija', 'Ivo Andrić', '9788610107618', 'HISTORY', 'Roman o mostu u Višegradu i sudbinama ljudi oko njega.', NULL, 5, 3),
(2, 'Seoba', 'Miloš Crnjanski', '9788610107625', 'FICTION', 'Modernistički roman o srpskim doseljenicima.', NULL, 4, 2),
(3, 'Koreni', 'Dobrica Ćosić', '9788610107632', 'FICTION', 'Porodična saga kroz istoriju Srbije.', NULL, 3, 1),
(4, 'Sapiens', 'Yuval Noah Harari', '9780062316110', 'NON_FICTION', 'Kratka istorija čovečanstva.', NULL, 6, 4),
(5, 'Kratka istorija skoro svega', 'Bill Bryson', '9780767908184', 'SCIENCE', 'Pristupačan uvod u nauku.', NULL, 5, 5),
(6, 'Struktura naučnih revolucija', 'Thomas Kuhn', '9780226458083', 'SCIENCE', 'Klasična filozofija nauke.', NULL, 2, 2),
(7, 'Ana Karenjina', 'Lav Tolstoj', '9780140449174', 'ROMANCE', 'Veliki ruski roman o ljubavi i društvu.', NULL, 4, 3),
(8, 'Gospodar prstenova', 'J. R. R. Tolkien', '9780544003415', 'FICTION', 'Epska fantastika Srednje zemlje.', NULL, 8, 6),
(9, 'Ubistvo u Orijent ekspresu', 'Agata Kristi', '9780062693662', 'MYSTERY', 'Poirot rešava zagonetku u vozu.', NULL, 5, 4),
(10, 'Šuma tajni', 'Haruki Murakami', '9780307279464', 'MYSTERY', 'Suptilan roman o traženju.', NULL, 3, 2),
(11, 'Steve Jobs', 'Walter Isaacson', '9781451648539', 'BIOGRAPHY', 'Biografija suosnivača Apple-a.', NULL, 4, 3),
(12, 'Autobiografija', 'Mark Twain', '9780060955433', 'BIOGRAPHY', 'Memoari američkog pisca.', NULL, 2, 1),
(13, 'Petar Pan', 'Dž. M. Barri', '9780142437933', 'CHILDREN', 'Avantura dečaka koji ne želi da odraste.', NULL, 6, 5),
(14, 'Mali princ', 'Antoan de Sent Egziperi', '9780156012195', 'CHILDREN', 'Čuvena priča o prijateljstvu.', NULL, 10, 8),
(15, 'Beograd: kroz vekove', 'Grupa autora', '9788679500123', 'OTHER', 'Zbirka eseja o istoriji Beograda.', NULL, 3, 3);

INSERT IGNORE INTO users (id, email, password, first_name, last_name, role, created_at) VALUES
(1, 'admin@beolib.rs', '$2b$10$5kwTaZh4/6bUwsNN2nFdg.S11M0yjRzFz15LHcXMobSYb/CJW5Zge', 'Admin', 'BeoLib', 'ADMIN', NOW()),
(2, 'user1@beolib.rs', '$2b$10$xZLkPDUPhqyPywj.FDAqfui.Y6D3kSBLgCuB7keFC450ICsmMpnVO', 'Marko', 'Petrović', 'USER', NOW()),
(3, 'user2@beolib.rs', '$2b$10$2F0AV6q3ADyboLsv3JyssevbiAkFIHdcrJ8CtNOkP36CzIyvsTW76', 'Ana', 'Jovanović', 'USER', NOW());

-- Neravnomerna podela inventara po filijalama (suma po knjizi = books.total/available_copies)
INSERT IGNORE INTO branch_book_inventory (id, book_id, branch_id, total_copies, available_copies, version) VALUES
-- Knjiga 1: total=5, available=3
(1, 1, 1, 2, 1, 0),
(2, 1, 2, 1, 1, 0),
(3, 1, 3, 1, 0, 0),
(4, 1, 4, 1, 1, 0),
-- Knjiga 2: total=4, available=2
(5, 2, 1, 2, 1, 0),
(6, 2, 2, 1, 0, 0),
(7, 2, 3, 1, 1, 0),
-- Knjiga 3: total=3, available=1
(8, 3, 1, 1, 0, 0),
(9, 3, 2, 1, 1, 0),
(10, 3, 3, 1, 0, 0),
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
-- Knjiga 10: total=3, available=2
(34, 10, 1, 1, 1, 0),
(35, 10, 2, 1, 0, 0),
(36, 10, 3, 1, 1, 0),
-- Knjiga 11: total=4, available=3
(37, 11, 1, 2, 2, 0),
(38, 11, 2, 1, 0, 0),
(39, 11, 3, 1, 1, 0),
-- Knjiga 12: total=2, available=1
(40, 12, 1, 1, 0, 0),
(41, 12, 3, 1, 1, 0),
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
(51, 14, 5, 1, 1, 0),
-- Knjiga 15: total=3, available=3
(52, 15, 1, 1, 1, 0),
(53, 15, 2, 1, 1, 0),
(54, 15, 3, 1, 1, 0);
