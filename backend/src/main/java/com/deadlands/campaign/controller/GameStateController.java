package com.deadlands.campaign.controller;

import com.deadlands.campaign.dto.ChangeMapRequest;
import com.deadlands.campaign.dto.GameStateResponse;
import com.deadlands.campaign.dto.TokenPositionDTO;
import com.deadlands.campaign.model.GameState;
import com.deadlands.campaign.model.TokenPosition;
import com.deadlands.campaign.service.GameStateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for game state management.
 *
 * Endpoints:
 * - GET /api/game/state - Get current game state and all token positions
 * - POST /api/game/map/change - Change map (GM only, clears all tokens)
 * - POST /api/game/reset - Reset game state (GM only)
 */
@RestController
@RequestMapping("/api/game")
public class GameStateController {

    private static final Logger logger = LoggerFactory.getLogger(GameStateController.class);

    @Autowired
    private GameStateService gameStateService;

    /**
     * Get the current game state including all token positions.
     *
     * This endpoint is used by:
     * - Players when they join the arena (to see existing tokens)
     * - Frontend to sync state after reconnection
     *
     * @return GameStateResponse with turn info and all token positions
     */
    @GetMapping("/state")
    public ResponseEntity<GameStateResponse> getGameState() {
        logger.debug("[GameStateController] GET /api/game/state");

        GameState gameState = gameStateService.getFullGameState();
        List<TokenPosition> positions = gameStateService.getAllTokenPositions();

        // Convert to DTOs
        List<TokenPositionDTO> positionDTOs = positions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        GameStateResponse response = GameStateResponse.builder()
                .turnNumber(gameState.getTurnNumber())
                .turnPhase(gameState.getTurnPhase())
                .currentMap(gameState.getCurrentMap())
                .tokenPositions(positionDTOs)
                .lastActivity(gameState.getLastActivity())
                .build();

        logger.info("[GameStateController] Returning game state: turn {}, {} tokens",
                gameState.getTurnNumber(), positionDTOs.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Change the current map.
     *
     * IMPORTANT: This clears ALL token positions, including tokens for players
     * who are not currently logged in. This ensures no player tokens carry over
     * between maps.
     *
     * Only Game Masters can change maps.
     *
     * @param request The new map ID
     * @return Success message
     */
    @PostMapping("/map/change")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<String> changeMap(@RequestBody ChangeMapRequest request) {
        logger.info("[GameStateController] POST /api/game/map/change - GM changing map to: {}", request.getMapId());

        if (request.getMapId() == null || request.getMapId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Map ID cannot be empty");
        }

        gameStateService.changeMap(request.getMapId());

        String message = String.format("Map changed to: %s. All token positions cleared.", request.getMapId());
        logger.info("[GameStateController] {}", message);

        return ResponseEntity.ok(message);
    }

    /**
     * Reset the game state.
     *
     * Clears all token positions and resets turn to 1.
     * Does NOT change the current map.
     *
     * Only Game Masters can reset game state.
     *
     * @return Success message
     */
    @PostMapping("/reset")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<String> resetGameState() {
        logger.info("[GameStateController] POST /api/game/reset - GM resetting game state");

        gameStateService.resetGameState();

        String message = "Game state reset. All token positions cleared, turn reset to 1.";
        logger.info("[GameStateController] {}", message);

        return ResponseEntity.ok(message);
    }

    /**
     * Convert TokenPosition entity to DTO.
     */
    private TokenPositionDTO convertToDTO(TokenPosition position) {
        return TokenPositionDTO.builder()
                .tokenId(position.getTokenId())
                .tokenType(position.getTokenType())
                .gridX(position.getGridX())
                .gridY(position.getGridY())
                .lastMovedBy(position.getLastMovedBy())
                .lastMoved(position.getLastMoved())
                .characterId(position.getCharacter() != null ? position.getCharacter().getId() : null)
                .build();
    }
}
