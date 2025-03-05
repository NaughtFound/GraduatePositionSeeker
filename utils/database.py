import pickle
import os
import pathlib
from typing import Type
from .model import DictModel


class Database:
    def __init__(self) -> None:
        pathlib.Path("./data").mkdir(parents=True, exist_ok=True)

    def _get_obj(self, pkl_path) -> dict:
        if not os.path.exists(pkl_path):
            return {}

        with open(pkl_path, "rb") as f:
            return pickle.load(f)

    def _save_obj(self, obj, pkl_path):
        with open(pkl_path, "wb") as f:
            pickle.dump(obj, f)

        return True

    def save(self, obj_id, data: DictModel):
        link = os.path.join("./data", data.__class__.__qualname__ + ".pkl")
        obj = self._get_obj(link)

        obj[obj_id] = data.to_dict()

        return self._save_obj(obj, link)

    def get(self, obj_id, obj_type: Type[DictModel]):
        link = os.path.join("./data", obj_type.__qualname__ + ".pkl")
        obj = self._get_obj(link)

        return obj.get(obj_id, None)

    def drop(self, obj_id, obj_type: Type[DictModel]):
        link = os.path.join("./data", obj_type.__qualname__ + ".pkl")
        obj = self._get_obj(link)

        obj.pop(obj_id, {})
        return self._save_obj(obj, link)

    def get_all(self, obj_type: Type[DictModel], to_list: bool = True):
        link = os.path.join("./data", obj_type.__qualname__ + ".pkl")
        obj = self._get_obj(link)

        if to_list:
            return list(obj.items())

        return obj
