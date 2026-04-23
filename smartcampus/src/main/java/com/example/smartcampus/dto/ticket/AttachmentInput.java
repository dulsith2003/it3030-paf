package com.example.smartcampus.dto.ticket;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AttachmentInput(
    @NotBlank @Size(max = 160) String fileName,
    @NotBlank @Size(max = 60) String contentType,
    @Min(1) @Max(10240) Integer sizeKb
) {
}
