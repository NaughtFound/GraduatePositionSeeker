from utils.model import DictModel


class University(DictModel):
    name: str

    def __init__(self):
        super().__init__()

        self.name = ""


class Member(DictModel):
    name: str
    university: str
    email: str
    interests: str
    link: str

    def __init__(self):
        super().__init__()

        self.name = ""
        self.university = ""
        self.email = ""
        self.interests = ""
        self.link = ""


class Position(DictModel):
    title: str
    deadline: str
    link: str
    desc: str

    def __init__(self):
        super().__init__()

        self.title = ""
        self.deadline = ""
        self.link = ""
        self.desc = ""
