package com.example.smartcampus.controller;

import com.example.smartcampus.dto.MongoHealthResponse;
import org.bson.Document;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.mongodb.core.MongoTemplate;

@RestController
@RequestMapping("/api/health")
public class MongoHealthController {

    private final MongoTemplate mongoTemplate;

    public MongoHealthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/mongodb")
    public ResponseEntity<MongoHealthResponse> mongodbStatus() {
        try {
            Document result = mongoTemplate.executeCommand(new Document("ping", 1));
            Object okValue = result.get("ok");
            boolean connected = okValue instanceof Number && ((Number) okValue).doubleValue() == 1.0;

            if (connected) {
                return ResponseEntity.ok(new MongoHealthResponse(true, "MongoDB connected"));
            }

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new MongoHealthResponse(false, "MongoDB ping failed"));
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new MongoHealthResponse(false, "MongoDB not connected: " + exception.getMessage()));
        }
    }
}
