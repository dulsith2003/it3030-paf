package com.example.smartcampus.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.smartcampus.model.Resource;
import com.example.smartcampus.model.ResourceStatus;
import com.example.smartcampus.model.ResourceType;
import com.example.smartcampus.repository.ResourceRepository;

@Service
public class ResourceService {

	private final ResourceRepository resourceRepository;

	public ResourceService(ResourceRepository resourceRepository) {
		this.resourceRepository = resourceRepository;
	}

	public Resource create(Resource resource) {
		validateCapacity(resource);
		resource.setId(null);
		return resourceRepository.save(resource);
	}

	public List<Resource> getAll() {
		return resourceRepository.findAll();
	}

    public List<Resource> search(String type, String location, Integer capacity, String status) {
        if (hasText(type)) {
            ResourceType resourceType = parseResourceType(type);
            if (resourceType == null) {
                return List.of();
            }
            return resourceRepository.findByType(resourceType);
        } else if (hasText(location)) {
            return resourceRepository.findByLocationContainingIgnoreCase(location.trim());
        } else if (capacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(capacity);
        } else if (hasText(status)) {
            ResourceStatus resourceStatus = parseResourceStatus(status);
            if (resourceStatus == null) {
                return List.of();
            }
            return resourceRepository.findByStatus(resourceStatus);
        }

        return resourceRepository.findAll();
    }

    public Resource getById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

	public Resource update(String id, Resource updated) {
		validateCapacity(updated);

		Resource existing = getById(id);
		existing.setName(updated.getName());
		existing.setType(updated.getType());
		existing.setCapacity(updated.getCapacity());
		existing.setLocation(updated.getLocation());
		existing.setStatus(updated.getStatus());
		existing.setAvailableFrom(updated.getAvailableFrom());
		existing.setAvailableTo(updated.getAvailableTo());
		existing.setDescription(updated.getDescription());

		return resourceRepository.save(existing);
	}

	public void delete(String id) {
		Resource existing = getById(id);
		resourceRepository.delete(existing);
	}

    private void validateCapacity(Resource resource) {
        if (resource.getCapacity() == null || resource.getCapacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be greater than 0");
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private ResourceType parseResourceType(String value) {
        try {
            return ResourceType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private ResourceStatus parseResourceStatus(String value) {
        try {
            return ResourceStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
