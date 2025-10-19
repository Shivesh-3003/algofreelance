"""
Custom exceptions for AlgoFreelance backend API
Provides specific error types for different failure scenarios
"""

class AlgoFreelanceError(Exception):
    """Base exception for all AlgoFreelance errors"""
    def __init__(self, message: str, error_code: str = "UNKNOWN_ERROR"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


class ContractNotFoundError(AlgoFreelanceError):
    """Raised when a contract/application cannot be found"""
    def __init__(self, app_id: int):
        super().__init__(
            message=f"Contract with App ID {app_id} not found",
            error_code="CONTRACT_NOT_FOUND"
        )
        self.app_id = app_id


class InvalidTransactionStateError(AlgoFreelanceError):
    """Raised when trying to perform an action in an invalid contract state"""
    def __init__(self, current_state: int, required_state: int, action: str):
        super().__init__(
            message=f"Cannot {action}: contract is in state {current_state}, requires state {required_state}",
            error_code="INVALID_STATE"
        )
        self.current_state = current_state
        self.required_state = required_state
        self.action = action


class InvalidAddressError(AlgoFreelanceError):
    """Raised when an Algorand address is invalid"""
    def __init__(self, address: str, reason: str = ""):
        message = f"Invalid Algorand address: {address}"
        if reason:
            message += f" ({reason})"
        super().__init__(
            message=message,
            error_code="INVALID_ADDRESS"
        )
        self.address = address


class InsufficientBalanceError(AlgoFreelanceError):
    """Raised when an account has insufficient balance for an operation"""
    def __init__(self, address: str, required: int, available: int):
        super().__init__(
            message=f"Insufficient balance: {address} has {available} microALGOs, needs {required}",
            error_code="INSUFFICIENT_BALANCE"
        )
        self.address = address
        self.required = required
        self.available = available


class IPFSUploadError(AlgoFreelanceError):
    """Raised when IPFS upload fails"""
    def __init__(self, reason: str):
        super().__init__(
            message=f"IPFS upload failed: {reason}",
            error_code="IPFS_UPLOAD_ERROR"
        )


class InvalidIPFSHashError(AlgoFreelanceError):
    """Raised when IPFS hash format is invalid"""
    def __init__(self, ipfs_hash: str, reason: str = ""):
        message = f"Invalid IPFS hash: {ipfs_hash}"
        if reason:
            message += f" ({reason})"
        super().__init__(
            message=message,
            error_code="INVALID_IPFS_HASH"
        )
        self.ipfs_hash = ipfs_hash


class TransactionConstructionError(AlgoFreelanceError):
    """Raised when transaction construction fails"""
    def __init__(self, transaction_type: str, reason: str):
        super().__init__(
            message=f"Failed to construct {transaction_type} transaction: {reason}",
            error_code="TRANSACTION_CONSTRUCTION_ERROR"
        )
        self.transaction_type = transaction_type


class InvalidEscrowAmountError(AlgoFreelanceError):
    """Raised when escrow amount is invalid (zero or negative)"""
    def __init__(self, amount: int):
        super().__init__(
            message=f"Invalid escrow amount: {amount} microALGOs (must be > 0)",
            error_code="INVALID_ESCROW_AMOUNT"
        )
        self.amount = amount

