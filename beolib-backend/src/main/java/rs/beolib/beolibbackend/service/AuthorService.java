package rs.beolib.beolibbackend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.jparepo.AuthorRepository;
import rs.beolib.beolibbackend.model.Author;

@Service
@Transactional
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    @Transactional(readOnly = true)
    public List<String> searchByName(String search) {
        if (search == null || search.isBlank()) {
            return List.of();
        }
        return authorRepository.findTop10ByNameContainingIgnoreCaseOrderByNameAsc(search.trim()).stream()
                .map(Author::getName)
                .toList();
    }

    public Author findOrCreateByName(String rawName) {
        if (rawName == null || rawName.isBlank()) {
            throw new IllegalArgumentException("Author name is required");
        }
        String normalizedName = rawName.trim().replaceAll("\\s+", " ");
        return authorRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> authorRepository.save(new Author(null, normalizedName)));
    }
}
