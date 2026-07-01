package rs.beolib.beolibbackend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.dto.BranchDto;
import rs.beolib.beolibbackend.exception.ResourceNotFoundException;
import rs.beolib.beolibbackend.jparepo.LibraryBranchRepository;
import rs.beolib.beolibbackend.mapper.BranchMapper;
import rs.beolib.beolibbackend.model.LibraryBranch;

@Service
@Transactional
public class BranchService {

    private final LibraryBranchRepository libraryBranchRepository;

    public BranchService(LibraryBranchRepository libraryBranchRepository) {
        this.libraryBranchRepository = libraryBranchRepository;
    }

    @Transactional(readOnly = true)
    public List<BranchDto> findAll() {
        return libraryBranchRepository.findAll().stream().map(BranchMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public BranchDto findById(Long id) {
        LibraryBranch branch = libraryBranchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + id));
        return BranchMapper.toDto(branch);
    }
}
