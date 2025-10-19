import pytest
from algopy_testing import AlgopyTestContext, algopy_testing_context
from collections.abc import Iterator
from algopy import Application

@pytest.fixture()
def context() -> Iterator[AlgopyTestContext]:
    """Fixture to provide a configured test context."""
    with algopy_testing_context() as ctx:
        yield ctx

@pytest.fixture()
def app_id(context: AlgopyTestContext, contract) -> Application:
    """Fixture to provide an application ID for tests."""
    app = context.any.application()
    # Link the contract to the application using object.__setattr__ to avoid recursion
    object.__setattr__(contract, '__app_id__', app.id)
    return app