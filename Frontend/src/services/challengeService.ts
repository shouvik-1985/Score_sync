import axiosInstance from "@/services/axiosInstance";

export const fetchMyChallenges = async () => {
  const res = await axiosInstance.get("/challenges/");
  return res.data;
};

export const createChallenge = async (data: {
  receiver_id: number;
  game_id: number;
  scheduled_time: string;
}) => {
  try {
    const res = await axiosInstance.post("/challenges/create/", data);
    console.log("Challenge API response:", res); // ✅ Log to see what actually comes back
    return res.data;
  } catch (error) {
    console.error("createChallenge failed:", error); // ✅ Debug the actual error
    throw error;
  }
};


export const respondToChallenge = async (
  challengeId: number,
  action: "accept" | "decline"
) => {
  const res = await axiosInstance.post(`/challenges/${challengeId}/respond/`, { action });
  return res.data;
};


export const submitTennisMatch = async (
  challengeId: number,
  player1Score: number,
  player2Score: number,
  winnerId: number
) => {
  const response = await axiosInstance.post(`/challenges/${challengeId}/tennis-match/`, {
    player1_score: player1Score,
    player2_score: player2Score,
    winner_id: winnerId,
  });
  return response.data;
};

export const getCompletedChallenges = async () => {
  const res = await axiosInstance.get('/challenges/completed/');
  return res.data;
};



// export const listChallenges = async () => {
//   const res = await axiosInstance.get("/challenges/");
//   return res.data;
// };