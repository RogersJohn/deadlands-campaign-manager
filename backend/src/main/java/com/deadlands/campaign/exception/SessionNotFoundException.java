package com.deadlands.campaign.exception;

/**
 * Exception thrown when a requested game session is not found.
 */
public class SessionNotFoundException extends RuntimeException {

    public SessionNotFoundException(Long sessionId) {
        super("Session not found with ID: " + sessionId);
    }

    public SessionNotFoundException(String message) {
        super(message);
    }
}
