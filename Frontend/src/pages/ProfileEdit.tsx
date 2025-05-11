import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import axios from "@/services/axiosInstance";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const allGames = ["Tennis", "Badminton", "Football", "Basketball", "Table Tennis"];

const ProfileEdit = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const { setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/profile/");
        const { full_name, username, bio, email, games } = response.data;
        setFullName(full_name || "");
        setUsername(username || "");
        setBio(bio || "");
        setEmail(email || "");
        setSelectedGames(games || []);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  const toggleGame = (game: string) => {
    setSelectedGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put("/profile/update/", {
        full_name: fullName,
        username,
        bio,
        email,
        games: selectedGames,
      });
      toast({ title: "Profile updated" });
      setUser(res.data.user); // correct usage
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error?.response?.data?.error || "Something went wrong.",
        variant: "destructive",
      });
      console.error("Update error", error);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-muted-foreground">Update your profile information</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Games</label>
              <div className="flex flex-wrap gap-2">
                {allGames.map((game) => (
                  <Button
                    key={game}
                    type="button"
                    variant={selectedGames.includes(game) ? "default" : "outline"}
                    onClick={() => toggleGame(game)}
                    className="text-sm"
                  >
                    {game}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="bg-scoresync-blue hover:bg-scoresync-blue/90">
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/profile")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ProfileEdit;
