package com.deadlands.campaign.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time multiplayer game sessions.
 *
 * Architecture:
 * - Clients connect via STOMP over WebSocket at /ws endpoint
 * - Simple in-memory message broker handles pub/sub messaging
 * - /topic/* for broadcasts to all session participants
 * - /queue/* for private messages to individual users
 * - /app/* prefix for client messages to server
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for pub/sub messaging
        // /topic: broadcast to all subscribers (e.g., /topic/session/{sessionId}/updates)
        // /queue: private messages to individual users (e.g., /queue/game-view)
        config.enableSimpleBroker("/topic", "/queue");

        // Prefix for messages FROM client TO server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint at /ws
        // SockJS fallback for browsers that don't support WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // TODO: Restrict in production
                .withSockJS();
    }
}
