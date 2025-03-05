import os
from dotenv import load_dotenv


class Env:
    def __init__(self) -> None:
        self.service_account = os.getenv("SERVICE_ACCOUNT")
        self.token_addr = os.getenv("TOKEN_ADDR")
        self.cred_addr = os.getenv("CRED_ADDR")

    @staticmethod
    def load() -> None:
        load_dotenv()
