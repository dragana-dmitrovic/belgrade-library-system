package rs.beolib.beolibbackend.mapper;

import rs.beolib.beolibbackend.dto.BookBranchAvailabilityDto;
import rs.beolib.beolibbackend.model.BranchBookInventory;

public final class BranchBookInventoryMapper {

    private BranchBookInventoryMapper() {
    }

    public static BookBranchAvailabilityDto toDto(BranchBookInventory inventory) {
        if (inventory == null) {
            return null;
        }
        return new BookBranchAvailabilityDto(
                inventory.getBranch().getId(),
                inventory.getBranch().getName(),
                inventory.getTotalCopies(),
                inventory.getAvailableCopies()
        );
    }
}
