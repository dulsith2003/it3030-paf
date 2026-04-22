package com.example.smartcampus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
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
    @ResponseStatus(HttpStatus.CREATED)
    public Resource create(@RequestBody Resource resource) {
        return resourceService.create(resource);
    }

    @GetMapping
    public List<Resource> getAll() {
        return resourceService.getAll();
    }

    @GetMapping("/search")
    public List<Resource> search(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) Integer capacity,
        @RequestParam(required = false) String status
    ) {
        return resourceService.search(type, location, capacity, status);
    }

    @GetMapping("/{id}")
    public Resource getById(@PathVariable String id) {
        return resourceService.getById(id);
    }

    @PutMapping("/{id}")
    public Resource update(@PathVariable String id, @RequestBody Resource resource) {
        return resourceService.update(id, resource);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        resourceService.delete(id);
    }
}
