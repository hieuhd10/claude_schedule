from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class IssueState(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


class Comment(BaseModel):
    id: int
    body: str
    author: str
    created_at: datetime
    updated_at: datetime
    html_url: str


class Issue(BaseModel):
    number: int
    title: str
    body: str
    state: IssueState
    labels: list[str]
    assignee: str | None
    author: str
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None
    html_url: str


class PullRequest(BaseModel):
    number: int
    title: str
    state: IssueState
    merged: bool
    head_branch: str
    base_branch: str
    head_sha: str
    author: str
    created_at: datetime
    updated_at: datetime
    merged_at: datetime | None
    closed_at: datetime | None
    html_url: str


class TimelineEvent(BaseModel):
    event: str
    actor: str | None
    created_at: datetime | None
    html_url: str | None
    raw: dict


class CheckRun(BaseModel):
    name: str
    status: str
    conclusion: str | None
    html_url: str | None
    started_at: datetime | None
    completed_at: datetime | None


class Commit(BaseModel):
    sha: str
    message: str
    author: str | None
    committed_at: datetime | None
    html_url: str
