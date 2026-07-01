package rs.beolib.beolibbackend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private LocalDateTime createdAt;
}
