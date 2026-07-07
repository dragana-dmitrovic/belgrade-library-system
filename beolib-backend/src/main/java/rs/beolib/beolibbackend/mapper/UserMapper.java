package rs.beolib.beolibbackend.mapper;

import rs.beolib.beolibbackend.dto.UserDto;
import rs.beolib.beolibbackend.model.User;
import rs.beolib.beolibbackend.util.UserTypeResolver;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        User resolved = UserTypeResolver.unproxy(user);
        return new UserDto(
                resolved.getId(),
                resolved.getEmail(),
                UserTypeResolver.extractFirstName(resolved),
                UserTypeResolver.extractLastName(resolved),
                UserTypeResolver.resolveRole(resolved),
                resolved.getCreatedAt()
        );
    }

    static String resolveRole(User user) {
        return UserTypeResolver.resolveRole(user);
    }

    static String extractFirstName(User user) {
        return UserTypeResolver.extractFirstName(user);
    }

    static String extractLastName(User user) {
        return UserTypeResolver.extractLastName(user);
    }

    static String extractFullName(User user) {
        return UserTypeResolver.extractFullName(user);
    }
}
