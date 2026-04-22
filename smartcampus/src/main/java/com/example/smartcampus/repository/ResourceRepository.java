package com.example.smartcampus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.smartcampus.model.Resource;
import com.example.smartcampus.model.ResourceStatus;
import com.example.smartcampus.model.ResourceType;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    List<Resource> findByNameContainingIgnoreCase(String name);
}
