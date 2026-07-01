package rs.beolib.beolibbackend.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rs.beolib.beolibbackend.dto.ApiResponse;
import rs.beolib.beolibbackend.dto.BranchDto;
import rs.beolib.beolibbackend.service.BranchService;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<BranchDto>> getAll() {
        List<BranchDto> list = branchService.findAll();
        return ResponseEntity.ok(ApiResponse.ok("Branches loaded", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchDto>> getById(@PathVariable Long id) {
        BranchDto branch = branchService.findById(id);
        return ResponseEntity.ok(ApiResponse.ok("Branch loaded", branch));
    }
}
