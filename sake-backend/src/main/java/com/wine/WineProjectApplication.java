package com.wine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WineProjectApplication {

	public static void main(String[] args) {
		// Override system timezone to prevent PostgreSQL timezone errors
		java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
		SpringApplication.run(WineProjectApplication.class, args);
	}

}
