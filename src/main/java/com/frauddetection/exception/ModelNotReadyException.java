package com.frauddetection.exception;

public class ModelNotReadyException extends RuntimeException {
    public ModelNotReadyException(String message) {
        super(message);
    }
}
