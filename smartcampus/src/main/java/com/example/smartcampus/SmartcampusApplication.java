package com.example.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(excludeName = {
	"org.springframework.ai.vectorstore.mongodb.autoconfigure.MongoDBAtlasVectorStoreAutoConfiguration"
}, exclude = {
	org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration.class,
	org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration.class
})
public class SmartcampusApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartcampusApplication.class, args);
	}

}
