package rs.beolib.beolibbackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.jparepo.BookCopyRepository;
import rs.beolib.beolibbackend.jparepo.BranchBookInventoryRepository;
import rs.beolib.beolibbackend.model.BookCopy;
import rs.beolib.beolibbackend.model.BookCopyStatus;
import rs.beolib.beolibbackend.model.BranchBookInventory;
import rs.beolib.beolibbackend.service.BranchBookInventoryService;

@Component
public class BookCopySeedRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BookCopySeedRunner.class);

    private final BookCopyRepository bookCopyRepository;
    private final BranchBookInventoryRepository branchBookInventoryRepository;
    private final BranchBookInventoryService branchBookInventoryService;

    public BookCopySeedRunner(
            BookCopyRepository bookCopyRepository,
            BranchBookInventoryRepository branchBookInventoryRepository,
            BranchBookInventoryService branchBookInventoryService
    ) {
        this.bookCopyRepository = bookCopyRepository;
        this.branchBookInventoryRepository = branchBookInventoryRepository;
        this.branchBookInventoryService = branchBookInventoryService;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (bookCopyRepository.count() > 0) {
            log.info("BookCopy seed skipped: book_copies already contains data");
            return;
        }

        var inventories = branchBookInventoryRepository.findAll();
        if (inventories.isEmpty()) {
            log.warn("BookCopy seed skipped: no BranchBookInventory rows found");
            return;
        }

        int created = 0;
        for (BranchBookInventory inventory : inventories) {
            Long bookId = inventory.getBook().getId();
            Long branchId = inventory.getBranch().getId();
            int totalCopies = inventory.getTotalCopies();

            for (int seq = 1; seq <= totalCopies; seq++) {
                BookCopy copy = new BookCopy();
                copy.setBook(inventory.getBook());
                copy.setBranch(inventory.getBranch());
                copy.setCopyCode(formatCopyCode(bookId, branchId, seq));
                copy.setStatus(BookCopyStatus.AVAILABLE);
                bookCopyRepository.save(copy);
                created++;
            }

            branchBookInventoryService.syncInventoryFromBookCopies(bookId, branchId);
        }

        inventories.stream()
                .map(inv -> inv.getBook().getId())
                .distinct()
                .forEach(branchBookInventoryService::syncBookAggregatesByBookId);

        log.info("BookCopy seed completed: created {} physical copies from {} inventory rows",
                created, inventories.size());
    }

    private static String formatCopyCode(Long bookId, Long branchId, int sequence) {
        return String.format("B%d-BR%d-%02d", bookId, branchId, sequence);
    }
}
