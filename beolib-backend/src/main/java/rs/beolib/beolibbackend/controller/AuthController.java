package rs.beolib.beolibbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rs.beolib.beolibbackend.dto.ApiResponse;
import rs.beolib.beolibbackend.dto.LoginRequest;
import rs.beolib.beolibbackend.dto.LoginResponse;
import rs.beolib.beolibbackend.dto.RegisterRequest;
import rs.beolib.beolibbackend.dto.TokenResponse;
import rs.beolib.beolibbackend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TokenResponse>> register(@Valid @RequestBody RegisterRequest request) {
        TokenResponse body = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(201, "Registered successfully", body));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse body = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", body));
    }
}
