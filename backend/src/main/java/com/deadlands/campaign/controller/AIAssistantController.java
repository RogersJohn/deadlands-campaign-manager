package com.deadlands.campaign.controller;

import com.deadlands.campaign.dto.*;
import com.deadlands.campaign.service.AIGameMasterService;
import com.deadlands.campaign.service.ImageGenerationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for AI-powered Game Master Assistant
 * Provides endpoints for NPC dialogue, encounters, rule lookups, and location generation
 */
@RestController
@RequestMapping("/ai-gm")
@CrossOrigin(origins = "${cors.allowed-origins}")
@Slf4j
public class AIAssistantController {

    private final AIGameMasterService aiGameMasterService;
    private final ImageGenerationService imageGenerationService;
    private final ObjectMapper objectMapper;

    public AIAssistantController(AIGameMasterService aiGameMasterService,
                                ImageGenerationService imageGenerationService,
                                ObjectMapper objectMapper) {
        this.aiGameMasterService = aiGameMasterService;
        this.imageGenerationService = imageGenerationService;
        this.objectMapper = objectMapper;
    }

    /**
     * Generate NPC dialogue
     * GM ONLY - Players cannot access AI Assistant
     */
    @PostMapping("/npc-dialogue")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<AIResponse> generateNPCDialogue(@Valid @RequestBody NPCDialogueRequest request) {
        log.info("NPC dialogue request for: {}", request.getNpcName());

        String response = aiGameMasterService.generateNPCDialogue(
                request.getNpcName(),
                request.getNpcPersonality() != null ? request.getNpcPersonality() : "A typical resident of the Weird West",
                request.getContext() != null ? request.getContext() : "A casual conversation",
                request.getPlayerQuestion()
        );

        return ResponseEntity.ok(new AIResponse(response));
    }

    /**
     * Generate random encounter
     * GM only feature
     */
    @PostMapping("/generate-encounter")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<AIResponse> generateEncounter(@Valid @RequestBody EncounterRequest request) {
        log.info("Encounter generation request for location: {}", request.getLocation());

        String response = aiGameMasterService.generateEncounter(
                request.getLocation(),
                request.getPartySize(),
                request.getAverageLevel()
        );

        return ResponseEntity.ok(new AIResponse(response));
    }

    /**
     * Look up game rules
     * GM ONLY - Players cannot access AI Assistant
     */
    @PostMapping("/rule-lookup")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<AIResponse> lookupRule(@Valid @RequestBody RuleLookupRequest request) {
        log.info("Rule lookup request: {}", request.getRuleQuestion());

        String response = aiGameMasterService.lookupRule(request.getRuleQuestion());

        return ResponseEntity.ok(new AIResponse(response));
    }

    /**
     * Generate location
     * GM only feature
     */
    @PostMapping("/generate-location")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<AIResponse> generateLocation(@Valid @RequestBody LocationRequest request) {
        log.info("Location generation request: {} {}", request.getSize(), request.getLocationType());

        String response = aiGameMasterService.generateLocation(
                request.getLocationType(),
                request.getSize()
        );

        return ResponseEntity.ok(new AIResponse(response));
    }

    /**
     * Get GM suggestions
     * GM only feature
     */
    @PostMapping("/gm-suggestion")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<AIResponse> getGMSuggestion(@RequestBody String situation) {
        log.info("GM suggestion request");

        String response = aiGameMasterService.generateGMSuggestion(situation);

        return ResponseEntity.ok(new AIResponse(response));
    }

    /**
     * Generate tactical battle map with terrain, buildings, and optional background image
     * GM ONLY - Players cannot access map generation
     */
    @PostMapping("/generate-map")
    @PreAuthorize("hasRole('GAME_MASTER')")
    public ResponseEntity<AIResponse> generateMap(@Valid @RequestBody MapGenerationRequest request) {
        log.info("Map generation request: {} {} map", request.getSize(), request.getLocationType());

        try {
            // Step 1: Generate map data using Claude
            String mapJson = aiGameMasterService.generateBattleMap(
                request.getLocationType(),
                request.getSize(),
                request.getTheme() != null ? request.getTheme() : "combat",
                request.getFeatures(),
                request.getDescription()
            );

            // Clean up potential markdown formatting from Claude
            mapJson = mapJson.trim();
            if (mapJson.startsWith("```json")) {
                mapJson = mapJson.substring(7);
            }
            if (mapJson.startsWith("```")) {
                mapJson = mapJson.substring(3);
            }
            if (mapJson.endsWith("```")) {
                mapJson = mapJson.substring(0, mapJson.length() - 3);
            }
            mapJson = mapJson.trim();

            // Parse the JSON to validate it
            MapGenerationResponse mapData = objectMapper.readValue(mapJson, MapGenerationResponse.class);

            // Step 2: Optionally generate background image
            if (request.isGenerateImage() && imageGenerationService.isAvailable()) {
                log.info("Generating background image for map: {}", mapData.getName());

                // Create image prompt from map data
                String imagePrompt = aiGameMasterService.generateImagePrompt(
                    mapData.getName(),
                    request.getLocationType(),
                    mapData.getDescription()
                );

                // Generate image (may take 10-30 seconds)
                String imageData = imageGenerationService.generateMapImage(
                    imagePrompt,
                    1024,
                    1024
                );

                if (imageData != null) {
                    mapData.setImageUrl(imageData);
                    mapData.setImagePrompt(imagePrompt);
                    log.info("Successfully generated background image");
                } else {
                    log.warn("Image generation failed, returning map data only");
                }
            } else {
                log.info("Skipping image generation (disabled or API key not configured)");
            }

            // Convert back to JSON string for response
            String finalJson = objectMapper.writeValueAsString(mapData);

            return ResponseEntity.ok(new AIResponse(finalJson));

        } catch (Exception e) {
            log.error("Error generating map: {}", e.getMessage(), e);
            return ResponseEntity.ok(new AIResponse(
                "Error generating map: " + e.getMessage() +
                ". Please check your request and try again."
            ));
        }
    }

    /**
     * Health check endpoint to verify AI service is configured
     * Public endpoint - no authentication required
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("AI Assistant service is available");
    }
}
