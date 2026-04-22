package com.example.smartcampus.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.smartcampus.exception.ResourceNotFoundException;
import com.example.smartcampus.model.Resource;
import com.example.smartcampus.repository.ResourceRepository;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public Resource create(Resource resource) {
        resource.setId(null);
        return resourceRepository.save(resource);
    }

    public List<Resource> getAll() {
        return resourceRepository.findAll();
    }

    public Resource getById(Long id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public Resource update(Long id, Resource updated) {
        Resource existing = getById(id);

        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setStatus(updated.getStatus());
        existing.setLocation(updated.getLocation());
        existing.setCapacity(updated.getCapacity());
        existing.setDescription(updated.getDescription());

        return resourceRepository.save(existing);
    }

    public void delete(Long id) {
        Resource existing = getById(id);
        resourceRepository.delete(existing);
    }
}
