from flask import Flask, render_template
from flask import request
from uuid import uuid4

# import utils.google_api as G
import utils.database as D
from utils.decorators import error_decorator
from models import Member, University, Position
from utils.env import Env

app = Flask(__name__)


@app.route("/")
@error_decorator()
def main():
    return render_template("index.html")


@app.route("/univ", methods=["GET", "POST", "DELETE"])
@error_decorator()
def universities_route():
    def get_universities():
        data = D.Database().get_all(University)

        return data

    def add_university():
        data = request.get_json()

        id = str(uuid4())
        univ = University().parse(data)

        D.Database().save(id, univ)

        return ""

    def delete_university():
        data = request.get_json()

        id = data["univ_id"]
        D.Database().drop(id, University)

        return ""

    method_dict = {
        "get": get_universities,
        "post": add_university,
        "delete": delete_university,
    }

    return method_dict[request.method.lower()]()


@app.route("/members", methods=["GET", "POST", "DELETE"])
@error_decorator()
def members_route():
    def get_members():
        univ_dict = D.Database().get_all(University, False)

        data = D.Database().get_all(Member)

        for member in data:
            univ_id = member[1]["university"]
            if not univ_id:
                continue

            if univ_id in univ_dict:
                member[1]["university"] = univ_dict[univ_id]["name"]
            else:
                member[1]["university"] = ""

        return data

    def add_member():
        data = request.get_json()

        id = str(uuid4())
        member = Member().parse(data)

        D.Database().save(id, member)

        return ""

    def delete_member():
        data = request.get_json()

        id = data["member_id"]
        D.Database().drop(id, Member)

        return ""

    method_dict = {
        "get": get_members,
        "post": add_member,
        "delete": delete_member,
    }

    return method_dict[request.method.lower()]()


@app.route("/pos", methods=["GET", "POST", "DELETE"])
@error_decorator()
def positions_route():
    def get_positions():
        pos_id = request.args.get("pos_id")

        if pos_id:
            pos = D.Database().get_all(Position, False).get(pos_id)
            return pos

        data = D.Database().get_all(Position)

        return data

    def add_position():
        data = request.get_json()

        id = str(uuid4())
        position = Position().parse(data)

        D.Database().save(id, position)

        return ""

    def delete_position():
        data = request.get_json()

        id = data["pos_id"]
        D.Database().drop(id, Position)

        return ""

    method_dict = {
        "get": get_positions,
        "post": add_position,
        "delete": delete_position,
    }

    return method_dict[request.method.lower()]()


# @app.route("/doc", methods=["POST"])
# @error_decorator()
# def get_doc():
#     doc_id = request.form.get("doc_id")
#     document = G.get_doc(doc_id)

#     db = D.Database()
#     url = db.get_link(doc_id)

#     document["url"] = url or "ONBEKEND"

#     return document


# @app.route("/email", methods=["POST"])
# @error_decorator()
# def send_email():
#     doc_id = request.form.get("doc_id")
#     email_body = request.form.get("email_body")

#     doc = G.get_doc(doc_id)
#     title = doc.get("title").replace("\n", "").split("-")
#     title[0] = "Startmail"

#     email_subject = "".join(title)

#     res = G.send_email(email_subject, email_body)

#     if res:
#         return {"message": "Email Sent Successfully"}
#     else:
#         return {"message": "Got An Error While Sending The Email"}


if __name__ == "__main__":
    Env.load()
    app.debug = True
    app.run()
