package rs.beolib.beolibbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BookCreateRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 255)
    private String author;

    @NotBlank
    @Size(max = 32)
    private String isbn;

    @NotBlank
    private String genre;

    private String description;

    @Size(max = 1024)
    private String coverImageUrl;

    @NotNull
    @Min(0)
    private Integer totalCopies;

    @NotNull
    @Min(0)
    private Integer availableCopies;
}
