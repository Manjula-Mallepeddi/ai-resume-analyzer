
from app.utils.jwt import create_access_token

token = create_access_token(
    {
        "sub": "manjula@gmail.com"
    }
)

print(token)