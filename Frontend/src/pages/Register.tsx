import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "@/services/axiosInstance";
import { saveAuthData } from "@/services/auth";
import { Toaster, toast } from "@/components/ui/sonner";

// Firebase config (same as before)
const firebaseConfig = {
  apiKey: "AIzaSyDM4P96ZUTRn-unirz1fZVRPJNByMAWdAc",
  authDomain: "scoresync-3ce4c.firebaseapp.com",
  projectId: "scoresync-3ce4c",
  storageBucket: "scoresync-3ce4c.appspot.com",
  messagingSenderId: "644724320982",
  appId: "1:644724320982:web:53ab5afb21f54ba1f83777",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Available games options (you can extend later easily)
const gameOptions = [
  "Football",
  "Cricket",
  "Basketball",
  "Tennis",
  "Badminton",
  "Hockey",
  "Chess",
];

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let profilePictureUrl = "";

      // If user uploaded a profile picture, upload it to Firebase Storage
      if (profilePicture) {
        const storageRef = ref(storage, `profile_pictures/${username}_${Date.now()}`);
        await uploadBytes(storageRef, profilePicture);
        profilePictureUrl = await getDownloadURL(storageRef);
      }

      const response = await axios.post("/register/", {
        email,
        password,
        username,
        full_name: fullName,
        bio,
        games: selectedGames,
        profile_picture: profilePictureUrl,
      });

      saveAuthData(response.data.token, response.data);
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Registration failed!");
    }
  };

  const handleGameSelect = (game: string) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(selectedGames.filter(g => g !== game));
    } else {
      setSelectedGames([...selectedGames, game]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-to-br from-blue-50 to-white">
      <Toaster />
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h1>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 border rounded-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <textarea
            placeholder="Bio (optional)"
            className="w-full p-3 border rounded-lg"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          {/* Games Selection */}
          <div className="flex flex-wrap gap-2">
            {gameOptions.map((game) => (
              <button
                type="button"
                key={game}
                onClick={() => handleGameSelect(game)}
                className={`px-4 py-2 rounded-full border ${
                  selectedGames.includes(game)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {game}
              </button>
            ))}
          </div>

          {/* Profile Picture Upload */}
          <input
            type="file"
            accept="image/*"
            className="w-full p-3 border rounded-lg"
            onChange={(e) => setProfilePicture(e.target.files ? e.target.files[0] : null)}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
