from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from firebase_admin import auth as firebase_auth
import jwt
from decouple import config
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from firebase_admin import credentials, storage
from friends.models import Block
import requests
from games.models import Game
from .models import User
from .serializers import UserSerializer
from django.http import JsonResponse
from games.serializers import GameSerializer

User = get_user_model()

# Firebase Initialization
if not firebase_admin._apps:
    cred = credentials.Certificate('firebase/serviceAccountKey.json')  # Update path as needed
    firebase_admin.initialize_app(cred, {
        'storageBucket': config('FIREBASE_STORAGE_BUCKET')
    })

bucket = storage.bucket('scoresync-3ce4c.appspot.com')

# Helper: Token generation
def generate_token(user):
    payload = {
        'user_id': user.id,
        'email': user.email,
    }
    token = jwt.encode(payload, config('DJANGO_SECRET_KEY'), algorithm='HS256')
    return token

# ✅ Own profile
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_own_profile(request):
    user = request.user

    try:
        # Make sure you prefetch the related games
        user = User.objects.prefetch_related('games').get(id=user.id)

        data = {
            'user_id': user.id,
            'email': user.email,
            'username': user.username,
            'full_name': user.full_name,
            'bio': user.bio or "",
            'games': [{'id': g.id, 'name': g.name} for g in user.games.all()],
            'profile_picture': user.profile_picture,
            'is_blocked_by_me': False  # for consistency
        }

        print("DEBUG: Games being returned =>", data["games"])  # ✅ confirm
        return Response(data)

    except Exception as e:
        return Response({"error": f"Failed to load profile: {str(e)}"}, status=500)




# ✅ Register API
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        username = request.data.get('username')
        full_name = request.data.get('full_name')
        bio = request.data.get('bio', '')
        games = request.data.get('games', [])
        profile_picture_file = request.FILES.get('profile_picture')

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        profile_picture_url = ''
        if profile_picture_file:
            blob = bucket.blob(f"profile_pictures/{username}.jpg")
            blob.upload_from_file(profile_picture_file, content_type='image/jpeg')
            blob.make_public()
            profile_picture_url = blob.public_url

        user = User.objects.create_user(
            email=email,
            password=password,
            username=username,
            full_name=full_name,
            bio=bio,
            games=games,
            profile_picture=profile_picture_url
        )
        
        token = generate_token(user)

        return Response({'token': token, 'user_id': user.id, 'username': user.username})
    except Exception as e:
        print(e)
        return Response({'error': 'Something went wrong!'}, status=500)

# ✅ Login API
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(request, email=email, password=password)

    if user is not None:
        token = generate_token(user)
        return Response({'token': token, 'user_id': user.id, 'username': user.username})
    else:
        return Response({'error': 'Invalid credentials'}, status=400)

# ✅ Google Sign-In API
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def google_signin(request):
    print("GOOGLE SIGNIN HIT")
    id_token = request.data.get('id_token')

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        email = decoded_token['email']
        full_name = decoded_token.get('name', '')
        google_picture = decoded_token.get('picture', '')

        # Download image once
        profile_picture_url = ''
        if google_picture:
            try:
                response = requests.get(google_picture)
                if response.status_code == 200:
                    blob = bucket.blob(f"profile_pictures/{email}.jpg")
                    blob.upload_from_string(response.content, content_type='image/jpeg')
                    blob.make_public()
                    profile_picture_url = blob.public_url
            except Exception as e:
                print("Failed to upload profile picture:", e)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'full_name': full_name,
                'profile_picture': profile_picture_url,
            }
        )

        token = generate_token(user)
        return Response({'token': token, 'user_id': user.id, 'username': user.username})
    except Exception as e:
        print(e)
        return Response({'error': 'Invalid Google token'}, status=400)


# ✅ Get another user's profile
@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request, user_id):
    current_user = request.user

    # ❌ Only block if the *target user* blocked you
    if Block.objects.filter(blocker_id=user_id, blocked=current_user).exists():
        return Response({"error": "You cannot view this profile."}, status=403)

    try:
        user = User.objects.get(id=user_id)
        is_blocked_by_me = Block.objects.filter(blocker=current_user, blocked_id=user_id).exists()

        data = {
            'user_id': user.id,
            'email': user.email,
            'username': user.username,
            'full_name': user.full_name,
            'bio': user.bio,
            'games': [{"id": g.id, "name": g.name} for g in user.games.all()],
            'profile_picture': user.profile_picture,
            'is_blocked_by_me': is_blocked_by_me,  # ✅ so frontend shows Unblock button
        }
        return Response(data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)



# ✅ List All Users (for leaderboard, friends)
@api_view(['GET'])
@permission_classes([AllowAny])  # ✅ public access
def list_users(request):
    users = User.objects.all()
    data = [
        {
            'user_id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'games': GameSerializer(user.games.all(), many=True).data,
            'profile_picture': user.profile_picture,
        }
        for user in users
    ]
    return Response(data)


# ✅ Update profile
  # Make sure this is imported

@csrf_exempt
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user

    user.full_name = request.data.get('full_name', user.full_name)
    user.username = request.data.get('username', user.username)
    user.email = request.data.get('email', user.email)
    user.bio = request.data.get('bio', user.bio)

    games = request.data.get('games', [])

    # Convert game names to game IDs
    if isinstance(games, str):
        games = games.split(',')

    game_objs = Game.objects.filter(name__in=games)
    user.games.set(game_objs)

    user.save()

    return Response({
        'message': 'Profile updated successfully',
        'user': {
            'user_id': user.id,
            'full_name': user.full_name,
            'username': user.username,
            'email': user.email,
            'bio': user.bio,
            'games': [g.name for g in user.games.all()],
            'profile_picture': user.profile_picture,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)



