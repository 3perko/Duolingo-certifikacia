"""Authentication.

Production: Supabase Auth. The browser signs in against Supabase and sends the
access token; we verify it with the project's JWT secret (HS256) or its public
signing keys (JWKS, RS256/ES256).

Development: with AI_QUEST_DEV_AUTH=1 the API issues its own short-lived tokens
from /api/auth/dev-login, so the app can be tried without a Supabase project.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .config import get_settings
from .db import User, get_db

DEV_KID = "aiquest-dev"
DEV_AUDIENCE = "aiquest"
DEV_TTL_S = 30 * 24 * 3600


@dataclass
class Identity:
    sub: str
    email: str | None
    name: str | None


def issue_dev_token(sub: str, email: str | None, name: str | None) -> str:
    s = get_settings()
    if not s.dev_auth:
        raise HTTPException(404, "Dev login is disabled.")
    now = int(time.time())
    claims = {"sub": sub, "email": email, "name": name, "aud": DEV_AUDIENCE, "iat": now, "exp": now + DEV_TTL_S}
    return jwt.encode(claims, s.secret, algorithm="HS256", headers={"kid": DEV_KID})


@lru_cache
def _jwks_client(url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(f"{url}/auth/v1/.well-known/jwks.json", cache_keys=True)


def verify_token(token: str) -> Identity:
    s = get_settings()
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg")
        if s.dev_auth and header.get("kid") == DEV_KID:
            claims = jwt.decode(token, s.secret, algorithms=["HS256"], audience=DEV_AUDIENCE)
            return Identity(claims["sub"], claims.get("email"), claims.get("name"))
        if alg == "HS256" and s.supabase_jwt_secret:
            claims = jwt.decode(token, s.supabase_jwt_secret, algorithms=["HS256"], audience="authenticated")
        elif alg in ("RS256", "ES256") and s.supabase_url:
            key = _jwks_client(s.supabase_url).get_signing_key_from_jwt(token)
            claims = jwt.decode(token, key.key, algorithms=[alg], audience="authenticated")
        else:
            raise HTTPException(401, "Unsupported token.")
    except jwt.PyJWTError as e:
        raise HTTPException(401, "Invalid or expired token.") from e
    meta = claims.get("user_metadata") or {}
    return Identity(claims["sub"], claims.get("email"), meta.get("name") or meta.get("full_name"))


def _bearer(request: Request) -> str | None:
    h = request.headers.get("Authorization", "")
    return h[7:].strip() if h.lower().startswith("bearer ") else None


def _upsert(db: Session, ident: Identity) -> User:
    user = db.get(User, ident.sub)
    if user is None:
        name = (ident.name or (ident.email or "").split("@")[0] or "Learner")[:80]
        user = User(id=ident.sub, email=ident.email, name=name)
        db.add(user)
        db.commit()
    elif ident.email and user.email != ident.email:
        user.email = ident.email
        db.commit()
    return user


def optional_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    token = _bearer(request)
    if not token:
        return None
    return _upsert(db, verify_token(token))


def require_user(user: User | None = Depends(optional_user)) -> User:
    if user is None:
        raise HTTPException(401, "Sign in required.")
    return user
