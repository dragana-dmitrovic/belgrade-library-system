package rs.beolib.beolibbackend.connection;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI beolibOpenApi() {
        final String schemeName = "bearer-jwt";
        return new OpenAPI()
                .info(new Info()
                        .title("BeoLib API")
                        .description("Online library system for Belgrade public libraries")
                        .version("v1"))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"))
                .components(new Components()
                        .addSecuritySchemes(schemeName,
                                new SecurityScheme()
                                        .name(schemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
