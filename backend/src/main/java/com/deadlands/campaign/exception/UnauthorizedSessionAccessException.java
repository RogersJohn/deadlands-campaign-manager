package com.deadlands.campaign.exception;

/**
 * Exception thrown when a user attempts to access or modify a session without proper authorization.
 */
public class UnauthorizedSessionAccessException extends RuntimeException {

    public UnauthorizedSessionAccessException(String message) {
        super(message);
    }

    public UnauthorizedSessionAccessException(Long sessionId, String username) {
        super("User '" + username + "' is not authorized to access session " + sessionId);
    }
}
