package rs.beolib.beolibbackend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.connection.JwtService;
import rs.beolib.beolibbackend.dto.LoginRequest;
import rs.beolib.beolibbackend.dto.LoginResponse;
import rs.beolib.beolibbackend.dto.RegisterRequest;
import rs.beolib.beolibbackend.dto.TokenResponse;
import rs.beolib.beolibbackend.dto.UserDto;
import rs.beolib.beolibbackend.jparepo.UserRepository;
import rs.beolib.beolibbackend.mapper.UserMapper;
import rs.beolib.beolibbackend.model.User;
import rs.beolib.beolibbackend.model.UserRole;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String token = jwtService.generateToken(user);
        UserDto dto = UserMapper.toDto(user);
        return new LoginResponse(token, dto);
    }

    public TokenResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(UserRole.USER);
        user = userRepository.save(user);
        return new TokenResponse(jwtService.generateToken(user));
    }
}
