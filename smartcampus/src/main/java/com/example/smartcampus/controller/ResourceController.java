package com.example.smartcampus.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.smartcampus.model.Resource;
import com.example.smartcampus.service.ResourceService;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    public ResponseEntity<Resource> create(@RequestBody Resource resource) {
        Resource created = resourceService.create(resource);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getAll() {
        return ResponseEntity.ok(resourceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> update(@PathVariable Long id, @RequestBody Resource updated) {
        return ResponseEntity.ok(resourceService.update(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
