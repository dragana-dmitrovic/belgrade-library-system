package rs.beolib.beolibbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import rs.beolib.beolibbackend.dto.BookMetadataLookupDto;
import rs.beolib.beolibbackend.exception.BookNotFoundByIsbnException;
import rs.beolib.beolibbackend.exception.DuplicateIsbnException;
import rs.beolib.beolibbackend.exception.ExternalServiceUnavailableException;
import rs.beolib.beolibbackend.jparepo.BookRepository;
import rs.beolib.beolibbackend.model.BookGenre;

@Service
public class BookMetadataService {

    private static final String OPEN_LIBRARY_URL =
            "https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data";

    private static final List<Map.Entry<String, BookGenre>> GENRE_KEYWORDS = List.of(
            Map.entry("science fiction", BookGenre.FICTION),
            Map.entry("fiction", BookGenre.FICTION),
            Map.entry("romance", BookGenre.ROMANCE),
            Map.entry("mystery", BookGenre.MYSTERY),
            Map.entry("detective", BookGenre.MYSTERY),
            Map.entry("biography", BookGenre.BIOGRAPHY),
            Map.entry("autobiography", BookGenre.BIOGRAPHY),
            Map.entry("history", BookGenre.HISTORY),
            Map.entry("science", BookGenre.SCIENCE),
            Map.entry("juvenile", BookGenre.CHILDREN),
            Map.entry("children", BookGenre.CHILDREN),
            Map.entry("non-fiction", BookGenre.NON_FICTION),
            Map.entry("nonfiction", BookGenre.NON_FICTION)
    );

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final BookRepository bookRepository;

    public BookMetadataService(
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            BookRepository bookRepository
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.bookRepository = bookRepository;
    }

    public BookMetadataLookupDto lookupByIsbn(String rawIsbn) {
        String isbn = normalizeIsbn(rawIsbn);
        if (isbn.isBlank()) {
            throw new IllegalArgumentException("ISBN is required");
        }

        if (bookRepository.existsByIsbn(isbn)) {
            throw new DuplicateIsbnException("Knjiga sa tim ISBN već postoji");
        }

        JsonNode bookNode = fetchOpenLibraryBook(isbn);
        if (bookNode == null || bookNode.isNull() || bookNode.isMissingNode()) {
            throw new BookNotFoundByIsbnException("Knjiga nije pronađena za uneti ISBN");
        }

        return mapToDto(isbn, bookNode);
    }

    private JsonNode fetchOpenLibraryBook(String isbn) {
        try {
            String responseBody = restTemplate.getForObject(OPEN_LIBRARY_URL, String.class, isbn);
            if (responseBody == null || responseBody.isBlank()) {
                throw new ExternalServiceUnavailableException(
                        "Spoljni servis trenutno nedostupan, pokušajte kasnije"
                );
            }

            JsonNode root = objectMapper.readTree(responseBody);
            if (root == null || !root.isObject() || root.isEmpty()) {
                return null;
            }

            JsonNode bookNode = root.get("ISBN:" + isbn);
            if (bookNode == null || bookNode.isNull()) {
                return null;
            }
            return bookNode;
        } catch (BookNotFoundByIsbnException | DuplicateIsbnException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new ExternalServiceUnavailableException(
                    "Spoljni servis trenutno nedostupan, pokušajte kasnije",
                    ex
            );
        } catch (Exception ex) {
            throw new ExternalServiceUnavailableException(
                    "Spoljni servis trenutno nedostupan, pokušajte kasnije",
                    ex
            );
        }
    }

    private BookMetadataLookupDto mapToDto(String isbn, JsonNode bookNode) {
        String title = textOrNull(bookNode.get("title"));
        if (title == null || title.isBlank()) {
            throw new BookNotFoundByIsbnException("Knjiga nije pronađena za uneti ISBN");
        }

        String authorName = extractAuthorName(bookNode.get("authors"));
        String coverImageUrl = extractCoverUrl(bookNode.get("cover"));
        List<String> subjectNames = extractSubjectNames(bookNode.get("subjects"));
        BookGenre genre = mapGenre(subjectNames);

        return new BookMetadataLookupDto(
                isbn,
                title,
                authorName,
                genre.name(),
                coverImageUrl,
                extractDescription(bookNode)
        );
    }

    private String extractAuthorName(JsonNode authorsNode) {
        if (authorsNode == null || !authorsNode.isArray() || authorsNode.isEmpty()) {
            return null;
        }
        return textOrNull(authorsNode.get(0).get("name"));
    }

    private String extractCoverUrl(JsonNode coverNode) {
        if (coverNode == null || coverNode.isNull()) {
            return null;
        }
        String large = textOrNull(coverNode.get("large"));
        if (large != null && !large.isBlank()) {
            return large;
        }
        return textOrNull(coverNode.get("medium"));
    }

    private List<String> extractSubjectNames(JsonNode subjectsNode) {
        List<String> names = new ArrayList<>();
        if (subjectsNode == null || !subjectsNode.isArray()) {
            return names;
        }
        for (JsonNode subject : subjectsNode) {
            String name = textOrNull(subject.get("name"));
            if (name != null && !name.isBlank()) {
                names.add(name);
            }
        }
        return names;
    }

    private String extractDescription(JsonNode bookNode) {
        JsonNode descriptionNode = bookNode.get("description");
        if (descriptionNode != null && !descriptionNode.isNull()) {
            if (descriptionNode.isTextual()) {
                return descriptionNode.asText();
            }
            String value = textOrNull(descriptionNode.get("value"));
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return textOrNull(bookNode.get("notes"));
    }

    BookGenre mapGenre(List<String> subjectNames) {
        if (subjectNames == null || subjectNames.isEmpty()) {
            return BookGenre.OTHER;
        }
        for (String subject : subjectNames) {
            String normalized = subject.toLowerCase();
            for (Map.Entry<String, BookGenre> keyword : GENRE_KEYWORDS) {
                if (normalized.contains(keyword.getKey())) {
                    return keyword.getValue();
                }
            }
        }
        return BookGenre.OTHER;
    }

    private String normalizeIsbn(String rawIsbn) {
        if (rawIsbn == null) {
            return "";
        }
        return rawIsbn.replaceAll("[\\s-]", "");
    }

    private String textOrNull(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        return node.asText(null);
    }
}
