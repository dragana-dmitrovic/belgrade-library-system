package rs.beolib.beolibbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookMetadataLookupDto {

    private String isbn;
    private String title;
    private String authorName;
    private String genre;
    private String coverImageUrl;
    private String description;
}
