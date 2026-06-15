package com.my.project_linkus_back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ProjectLinkusBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjectLinkusBackApplication.class, args);
	}

}
