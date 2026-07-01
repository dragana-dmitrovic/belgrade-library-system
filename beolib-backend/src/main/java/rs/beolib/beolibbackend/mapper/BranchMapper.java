package rs.beolib.beolibbackend.mapper;

import rs.beolib.beolibbackend.dto.BranchDto;
import rs.beolib.beolibbackend.model.LibraryBranch;

public final class BranchMapper {

    private BranchMapper() {
    }

    public static BranchDto toDto(LibraryBranch branch) {
        if (branch == null) {
            return null;
        }
        return new BranchDto(
                branch.getId(),
                branch.getName(),
                branch.getAddress(),
                branch.getLatitude(),
                branch.getLongitude(),
                branch.getPhone(),
                branch.getEmail(),
                branch.getWorkingHours()
        );
    }
}
