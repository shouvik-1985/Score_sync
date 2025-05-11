import jwt
import firebase_admin
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework import authentication, exceptions
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth, credentials

User = get_user_model()

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')

        return (user, None)
    
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred)


# class FirebaseAuthentication(authentication.BaseAuthentication):
#     def authenticate(self, request):
#         id_token = self.get_token_from_request(request)
#         if not id_token:
#             return None

#         try:
#             decoded_token = auth.verify_id_token(id_token)
#         except Exception as e:
#             raise exceptions.AuthenticationFailed(f'Invalid Firebase token: {e}')

#         uid = decoded_token.get('uid')
#         if not uid:
#             raise exceptions.AuthenticationFailed('No UID in Firebase token.')

#         user, created = User.objects.get_or_create(uid=uid, defaults={
#             'username': decoded_token.get('email', uid),
#             'email': decoded_token.get('email', ''),
#             'full_name': decoded_token.get('name', ''),
#         })

#         return (user, None)

#     def get_token_from_request(self, request):
#         auth_header = request.META.get('HTTP_AUTHORIZATION')
#         if not auth_header:
#             return None
#         if auth_header.startswith('Bearer '):
#             return auth_header.split(' ')[1]
#         return None