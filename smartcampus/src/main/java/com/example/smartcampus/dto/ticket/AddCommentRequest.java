package com.example.smartcampus.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddCommentRequest(
    @NotBlank @Size(max = 500) String text
) {
}
