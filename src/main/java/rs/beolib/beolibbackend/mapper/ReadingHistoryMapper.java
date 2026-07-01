package rs.beolib.beolibbackend.mapper;

import rs.beolib.beolibbackend.dto.ReadingHistoryDto;
import rs.beolib.beolibbackend.model.ReadingHistory;

public final class ReadingHistoryMapper {

    private ReadingHistoryMapper() {
    }

    public static ReadingHistoryDto toDto(ReadingHistory h) {
        if (h == null) {
            return null;
        }
        return new ReadingHistoryDto(
                h.getId(),
                UserMapper.toDto(h.getUser()),
                BookMapper.toDto(h.getBook()),
                h.getFinishedAt(),
                h.getRating(),
                h.getReview()
        );
    }
}
