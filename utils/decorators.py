from functools import wraps


def error_decorator():
    def _error_decorator(f):
        @wraps(f)
        def __error_decorator(*args, **kwargs):
            try:
                result = f(*args, **kwargs)
                return result
            except Exception as e:
                print("[Error]", e)
                return {"message": str(e)}, 400
        return __error_decorator
    return _error_decorator
