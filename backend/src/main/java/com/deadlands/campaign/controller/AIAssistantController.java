package com.deadlands.campaign.controller;

import com.deadlands.campaign.dto.*;
import com.deadlands.campaign.service.AIGameMasterService;
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

    public AIAssistantController(AIGameMasterService aiGameMasterService) {
        this.aiGameMasterService = aiGameMasterService;
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
     * Health check endpoint to verify AI service is configured
     * Public endpoint - no authentication required
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("AI Assistant service is available");
    }
}
