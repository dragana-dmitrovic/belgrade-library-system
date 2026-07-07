package rs.beolib.beolibbackend.util;

import org.hibernate.Hibernate;
import rs.beolib.beolibbackend.model.Librarian;
import rs.beolib.beolibbackend.model.Member;
import rs.beolib.beolibbackend.model.User;

public final class UserTypeResolver {

    private UserTypeResolver() {
    }

    public static User unproxy(User user) {
        if (user == null) {
            return null;
        }
        return (User) Hibernate.unproxy(user);
    }

    public static String resolveRole(User user) {
        User resolved = unproxy(user);
        if (resolved instanceof Librarian) {
            return "LIBRARIAN";
        }
        if (resolved instanceof Member) {
            return "MEMBER";
        }
        throw new IllegalStateException("Unknown user type: " + resolved.getClass().getName());
    }

    public static Member requireMember(User user) {
        User resolved = unproxy(user);
        if (resolved instanceof Member member) {
            return member;
        }
        throw new IllegalArgumentException("Only library members can perform this action");
    }

    public static String extractFirstName(User user) {
        User resolved = unproxy(user);
        if (resolved instanceof Member member) {
            return member.getFirstName();
        }
        if (resolved instanceof Librarian librarian) {
            return librarian.getFirstName();
        }
        throw new IllegalStateException("Unknown user type: " + resolved.getClass().getName());
    }

    public static String extractLastName(User user) {
        User resolved = unproxy(user);
        if (resolved instanceof Member member) {
            return member.getLastName();
        }
        if (resolved instanceof Librarian librarian) {
            return librarian.getLastName();
        }
        throw new IllegalStateException("Unknown user type: " + resolved.getClass().getName());
    }

    public static String extractFullName(User user) {
        return extractFirstName(user) + " " + extractLastName(user);
    }
}
