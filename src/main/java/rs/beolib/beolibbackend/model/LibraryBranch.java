package rs.beolib.beolibbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "library_branches")
public class LibraryBranch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 512)
    private String address;

    private Double latitude;

    private Double longitude;

    @Column(length = 64)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(name = "working_hours", columnDefinition = "TEXT")
    private String workingHours;
}
