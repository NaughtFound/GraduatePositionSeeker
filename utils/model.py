class DictModel:
    def parse(self, res: dict):
        keys = self.__dict__

        for k in keys:
            if k in res:
                setattr(self, k, res.get(k))

        return self

    def to_dict(self):
        keys = self.__dict__

        res = {}

        for k in keys:
            value = getattr(self, k)

            if isinstance(value, DictModel):
                value = value.to_dict()

            res[k] = value

        return res
