from __future__ import print_function

import os.path
import base64
from google.auth.transport.requests import Request
from google.auth.exceptions import RefreshError
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from utils.env import Env

SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/gmail.compose",
]


def get_credentials():
    env = Env()

    token_addr = env.token_addr
    cred_addr = env.cred_addr
    creds = None

    def create_flow():
        flow = InstalledAppFlow.from_client_secrets_file(cred_addr, SCOPES)
        return flow.run_local_server(port=0)

    if os.path.exists(token_addr):
        creds = Credentials.from_authorized_user_file(token_addr, SCOPES)

    if not creds or not creds.valid:
        try:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                creds = create_flow()

        except RefreshError:
            creds = create_flow()

        with open(token_addr, "w") as token:
            token.write(creds.to_json())

    return creds


def send_email(to, email_subject, email_body):
    creds = get_credentials()
    try:
        service = build("gmail", "v1", credentials=creds)

        message = MIMEMultipart()
        message["to"] = to
        message["subject"] = email_subject
        text = MIMEText(email_body)
        message.attach(text)

        body = {"raw": base64.urlsafe_b64encode(message.as_bytes()).decode()}

        service.users().messages().send(userId="me", body=body).execute()

    except HttpError as err:
        print(err)

        return False

    return True
