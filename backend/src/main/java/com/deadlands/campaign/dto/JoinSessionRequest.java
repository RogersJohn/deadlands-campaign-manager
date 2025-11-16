package com.deadlands.campaign.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for joining a game session with a character.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinSessionRequest {

    @NotNull(message = "Character ID is required")
    private Long characterId;
}
