package com.deadlands.campaign.exception;

/**
 * Exception thrown when attempting to delete or modify an active session.
 */
public class SessionAlreadyActiveException extends RuntimeException {

    public SessionAlreadyActiveException(Long sessionId) {
        super("Cannot delete session " + sessionId + " because it is currently active. End the session first.");
    }

    public SessionAlreadyActiveException(String message) {
        super(message);
    }
}
