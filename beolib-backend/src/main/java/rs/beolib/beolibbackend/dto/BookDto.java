package rs.beolib.beolibbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookDto {

    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String genre;
    private String description;
    private String coverImageUrl;
    private int totalCopies;
    private int availableCopies;
    private Integer selectedBranchTotalCopies;
    private Integer selectedBranchAvailableCopies;
}
