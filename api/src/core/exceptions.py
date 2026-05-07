class AianoException(Exception):
    """Base exception for all Aiano application exceptions"""
    pass

class AuthenticationError(AianoException):
    """Raised when authentication fails"""
    pass

class AuthorizationError(AianoException):
    """Raised when user is not authorized to perform an action"""
    pass

class UserNotFoundError(AianoException):
    """Raised when a user is not found"""
    pass

class ProjectNotFoundError(AianoException):
    """Raised when a project is not found"""
    pass

class DocumentNotFoundError(AianoException):
    """Raised when a document is not found"""
    pass

class AnnotationNotFoundError(AianoException):
    """Raised when an annotation is not found"""
    pass

class QAPairNotFoundError(AianoException):
    """Raised when a Q&A pair is not found"""
    pass

class InvalidCredentialsError(AianoException):
    """Raised when credentials are invalid"""
    pass

class ValidationError(AianoException):
    """Raised when data validation fails"""
    pass

class ConflictError(AianoException):
    """Raised when there's a conflict (e.g., duplicate data)"""
    pass

class NotFoundError(AianoException):
    """Raised when a resource is not found"""
    pass

class DatabaseError(AianoException):
    """Raised when there's a database error"""
    pass

class ExternalServiceError(AianoException):
    """Raised when there's an error with external services"""
    pass
