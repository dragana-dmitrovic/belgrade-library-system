package rs.beolib.beolibbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchDto {

    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String email;
    private String workingHours;
}
