package com.example.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(excludeName = {
	"org.springframework.ai.vectorstore.mongodb.autoconfigure.MongoDBAtlasVectorStoreAutoConfiguration"
})
public class SmartcampusApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartcampusApplication.class, args);
	}

}
