package rs.beolib.beolibbackend.mapper;

import rs.beolib.beolibbackend.dto.UserDto;
import rs.beolib.beolibbackend.model.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
