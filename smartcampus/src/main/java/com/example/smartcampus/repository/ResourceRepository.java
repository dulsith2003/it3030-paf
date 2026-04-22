package com.example.smartcampus.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.smartcampus.model.Resource;
import com.example.smartcampus.model.ResourceStatus;
import com.example.smartcampus.model.ResourceType;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(int capacity);

    List<Resource> findByStatus(ResourceStatus status);
}
