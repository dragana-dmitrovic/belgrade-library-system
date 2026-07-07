package rs.beolib.beolibbackend.exception;

public class BookNotFoundByIsbnException extends RuntimeException {

    public BookNotFoundByIsbnException(String message) {
        super(message);
    }
}
