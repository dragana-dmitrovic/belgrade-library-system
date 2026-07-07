package rs.beolib.beolibbackend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.dto.BookBranchAvailabilityDto;
import rs.beolib.beolibbackend.exception.ResourceNotFoundException;
import rs.beolib.beolibbackend.jparepo.BookCopyRepository;
import rs.beolib.beolibbackend.jparepo.BookRepository;
import rs.beolib.beolibbackend.jparepo.BranchBookInventoryRepository;
import rs.beolib.beolibbackend.jparepo.LibraryBranchRepository;
import rs.beolib.beolibbackend.mapper.BranchBookInventoryMapper;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.BookCopyStatus;
import rs.beolib.beolibbackend.model.BranchBookInventory;
import rs.beolib.beolibbackend.model.LibraryBranch;

@Service
@Transactional
public class BranchBookInventoryService {

    public static final long DEFAULT_BRANCH_ID = 1L;

    private final BranchBookInventoryRepository branchBookInventoryRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final LibraryBranchRepository libraryBranchRepository;

    public BranchBookInventoryService(
            BranchBookInventoryRepository branchBookInventoryRepository,
            BookRepository bookRepository,
            BookCopyRepository bookCopyRepository,
            LibraryBranchRepository libraryBranchRepository
    ) {
        this.branchBookInventoryRepository = branchBookInventoryRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.libraryBranchRepository = libraryBranchRepository;
    }

    @Transactional(readOnly = true)
    public List<BookBranchAvailabilityDto> findAvailabilityByBookId(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new ResourceNotFoundException("Book not found: " + bookId);
        }
        return branchBookInventoryRepository.findAllByBookIdWithBranch(bookId).stream()
                .map(BranchBookInventoryMapper::toDto)
                .toList();
    }

    public BranchBookInventory requireForReservation(Long bookId, Long branchId) {
        return branchBookInventoryRepository.findByBook_IdAndBranch_Id(bookId, branchId)
                .orElseThrow(() -> new IllegalArgumentException("Book is not available at the selected branch"));
    }

    public void decrementAvailable(BranchBookInventory inventory) {
        if (inventory.getAvailableCopies() <= 0) {
            throw new IllegalArgumentException("No copies available at the selected branch");
        }
        inventory.setAvailableCopies(inventory.getAvailableCopies() - 1);
        branchBookInventoryRepository.save(inventory);
        syncBookAggregates(inventory.getBook());
    }

    public void incrementAvailable(Book book, LibraryBranch branch) {
        BranchBookInventory inventory = branchBookInventoryRepository
                .findByBook_IdAndBranch_Id(book.getId(), branch.getId())
                .orElseThrow(() -> new IllegalStateException("Branch inventory missing for returned reservation"));
        inventory.setAvailableCopies(inventory.getAvailableCopies() + 1);
        branchBookInventoryRepository.save(inventory);
        syncBookAggregates(book);
    }

    public void createDefaultInventory(Book book, int totalCopies, int availableCopies) {
        LibraryBranch defaultBranch = libraryBranchRepository.findById(DEFAULT_BRANCH_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Default branch not found"));
        BranchBookInventory inventory = new BranchBookInventory();
        inventory.setBook(book);
        inventory.setBranch(defaultBranch);
        inventory.setTotalCopies(totalCopies);
        inventory.setAvailableCopies(availableCopies);
        branchBookInventoryRepository.save(inventory);
    }

    public void adjustDefaultBranchInventory(Book book, int deltaTotal, int deltaAvailable) {
        BranchBookInventory inventory = branchBookInventoryRepository
                .findByBook_IdAndBranch_Id(book.getId(), DEFAULT_BRANCH_ID)
                .orElseGet(() -> createEmptyDefaultInventory(book));

        int newTotal = inventory.getTotalCopies() + deltaTotal;
        int newAvailable = inventory.getAvailableCopies() + deltaAvailable;
        if (newTotal < 0 || newAvailable < 0 || newAvailable > newTotal) {
            throw new IllegalArgumentException("Invalid inventory change for default branch");
        }

        inventory.setTotalCopies(newTotal);
        inventory.setAvailableCopies(newAvailable);
        branchBookInventoryRepository.save(inventory);
        syncBookAggregates(book);
    }

    public void syncBookAggregates(Book book) {
        List<BranchBookInventory> inventories = branchBookInventoryRepository.findAllByBook_Id(book.getId());
        int total = inventories.stream().mapToInt(BranchBookInventory::getTotalCopies).sum();
        int available = inventories.stream().mapToInt(BranchBookInventory::getAvailableCopies).sum();
        book.setTotalCopies(total);
        book.setAvailableCopies(available);
        bookRepository.save(book);
    }

    public void syncInventoryFromBookCopies(Long bookId, Long branchId) {
        BranchBookInventory inventory = branchBookInventoryRepository
                .findByBook_IdAndBranch_Id(bookId, branchId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Book is not available at the selected branch"));
        int totalCopies = (int) bookCopyRepository.countByBook_IdAndBranch_Id(bookId, branchId);
        int availableCopies = (int) bookCopyRepository.countByBook_IdAndBranch_IdAndStatus(
                bookId, branchId, BookCopyStatus.AVAILABLE);
        inventory.setTotalCopies(totalCopies);
        inventory.setAvailableCopies(availableCopies);
        branchBookInventoryRepository.save(inventory);
    }

    public void syncAfterBookCopyChange(Long bookId, Long branchId) {
        syncInventoryFromBookCopies(bookId, branchId);
        syncBookAggregatesByBookId(bookId);
    }

    public void syncBookAggregatesByBookId(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));
        syncBookAggregates(book);
    }

    private BranchBookInventory createEmptyDefaultInventory(Book book) {
        LibraryBranch defaultBranch = libraryBranchRepository.findById(DEFAULT_BRANCH_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Default branch not found"));
        BranchBookInventory inventory = new BranchBookInventory();
        inventory.setBook(book);
        inventory.setBranch(defaultBranch);
        inventory.setTotalCopies(0);
        inventory.setAvailableCopies(0);
        return inventory;
    }
}
