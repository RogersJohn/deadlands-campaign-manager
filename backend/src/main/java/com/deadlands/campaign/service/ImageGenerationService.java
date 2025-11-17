package com.deadlands.campaign.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for generating map background images using Stable Diffusion
 * Uses Replicate.com API (cheaper and easier than Stability.ai)
 */
@Service
@Slf4j
public class ImageGenerationService {

    @Value("${replicate.api-key:#{null}}")
    private String replicateApiKey;

    private final RestTemplate restTemplate;

    public ImageGenerationService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Generate a top-down map image using Stable Diffusion
     *
     * @param prompt Description of the map to generate
     * @param width Image width (default 1024)
     * @param height Image height (default 1024)
     * @return Base64-encoded image data (data:image/png;base64,...)
     */
    public String generateMapImage(String prompt, int width, int height) {
        if (replicateApiKey == null || replicateApiKey.isEmpty()) {
            log.warn("Replicate API key not configured, skipping image generation");
            return null;
        }

        try {
            log.info("Generating map image with prompt: {}", prompt);

            // Enhance prompt for hand-drawn illustrated battle maps (D&D/tabletop RPG style)
            String enhancedPrompt = String.format(
                "%s, hand-drawn illustrated battle map, tabletop RPG map, D&D style tactical map, " +
                "top-down orthographic view, painted illustration, colored pencil and ink style, " +
                "1870s old west Deadlands setting, professional game map quality, " +
                "detailed terrain features with colored outlines, rocks with brown outlines, " +
                "trees and bushes with green outlines, buildings with red/brown outlines, " +
                "natural ground textures (grass, dirt, sand, stone), grid-ready battle map, " +
                "hand-painted terrain, illustrated cover objects, tactical grid map, " +
                "artistic illustration, detailed linework, clean outlines",
                prompt
            );

            String negativePrompt = "photorealistic, photograph, satellite image, aerial photo, " +
                "blurry, perspective view, 3d rendering, isometric, diagonal view, " +
                "people, characters, animals, text, watermarks, low quality, " +
                "pixel art, anime, crude sketch, unfinished, messy, " +
                "curved perspective, fish-eye, distortion, modern buildings, cars, roads";

            // Call Replicate API
            // Using SDXL model for best quality
            String modelVersion = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

            Map<String, Object> input = new HashMap<>();
            input.put("prompt", enhancedPrompt);
            input.put("negative_prompt", negativePrompt);
            input.put("width", width);
            input.put("height", height);
            input.put("num_outputs", 1);
            input.put("scheduler", "K_EULER");
            input.put("num_inference_steps", 25);
            input.put("guidance_scale", 7.5);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("version", modelVersion);
            requestBody.put("input", input);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Token " + replicateApiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Create prediction
            ResponseEntity<Map> predictionResponse = restTemplate.postForEntity(
                "https://api.replicate.com/v1/predictions",
                request,
                Map.class
            );

            if (predictionResponse.getStatusCode() != HttpStatus.CREATED) {
                log.error("Failed to create prediction: {}", predictionResponse.getStatusCode());
                return null;
            }

            Map<String, Object> prediction = predictionResponse.getBody();
            String predictionId = (String) prediction.get("id");

            // Poll for completion (max 60 seconds)
            String imageUrl = pollForCompletion(predictionId, 60);

            if (imageUrl != null) {
                // Download image and convert to base64
                return downloadAndEncodeImage(imageUrl);
            }

            return null;

        } catch (Exception e) {
            log.error("Error generating map image: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Poll Replicate API for prediction completion
     */
    private String pollForCompletion(String predictionId, int maxSeconds) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Token " + replicateApiKey);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        int attempts = 0;
        int maxAttempts = maxSeconds;

        while (attempts < maxAttempts) {
            try {
                Thread.sleep(1000); // Wait 1 second between polls

                ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.replicate.com/v1/predictions/" + predictionId,
                    HttpMethod.GET,
                    request,
                    Map.class
                );

                Map<String, Object> prediction = response.getBody();
                String status = (String) prediction.get("status");

                log.debug("Prediction status: {}", status);

                if ("succeeded".equals(status)) {
                    Object output = prediction.get("output");
                    if (output instanceof java.util.List) {
                        java.util.List<?> outputs = (java.util.List<?>) output;
                        if (!outputs.isEmpty()) {
                            return (String) outputs.get(0);
                        }
                    }
                    return null;
                } else if ("failed".equals(status) || "canceled".equals(status)) {
                    log.error("Prediction failed with status: {}", status);
                    return null;
                }

                attempts++;

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return null;
            } catch (Exception e) {
                log.error("Error polling prediction: {}", e.getMessage());
                return null;
            }
        }

        log.warn("Prediction timed out after {} seconds", maxSeconds);
        return null;
    }

    /**
     * Download image from URL and encode as base64
     */
    private String downloadAndEncodeImage(String imageUrl) {
        try {
            log.info("Downloading image from: {}", imageUrl);

            ResponseEntity<byte[]> response = restTemplate.getForEntity(imageUrl, byte[].class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                byte[] imageBytes = response.getBody();
                String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                return "data:image/png;base64," + base64Image;
            }

            return null;

        } catch (Exception e) {
            log.error("Error downloading image: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if image generation is available (API key configured)
     */
    public boolean isAvailable() {
        return replicateApiKey != null && !replicateApiKey.isEmpty();
    }
}
