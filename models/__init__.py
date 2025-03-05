from utils.model import DictModel


class University(DictModel):
    name: str

    def __init__(self):
        super().__init__()

        self.name = ""


class Member(DictModel):
    name: str
    university: str
    interest: str
    link: str

    def __init__(self):
        super().__init__()

        self.name = ""
        self.university = ""
        self.interest = ""
        self.link = ""
