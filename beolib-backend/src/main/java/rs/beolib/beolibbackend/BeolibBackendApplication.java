package rs.beolib.beolibbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BeolibBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BeolibBackendApplication.class, args);
    }
}
