import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMyChallenges } from "@/services/challengeService";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/services/axiosInstance";


const ScoresPage = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    const data = await fetchMyChallenges();

    const filtered = data.filter((ch) => {
      const isParticipant = [ch.sender.id, ch.receiver.id].includes(user.id);
      const isAccepted = ch.status === "accepted";
      const hasWinner = ch.match && ch.match.winner;
      const isNotCompleted = ch.status !== "completed";

      return isParticipant && isAccepted && !hasWinner && isNotCompleted;
    });

    setChallenges(filtered);
  };

  fetchData();
}, []);



  const handleEnterMatch = async (challengeId: number) => {
    try {
      const res = await axiosInstance.post(`/games/start-match/${challengeId}/`);
      const match = res.data;
      navigate(`/scores/match/${match.id}`);
    } catch (err) {
      console.error("Failed to enter match:", err);
    }
  };
  

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {challenges.length ? (
            challenges.map((ch) => {
              const matchTime = new Date(ch.scheduled_time);
              const isMatchTime = isPast(matchTime);
              return (
                <div key={ch.id} className="p-3 border mb-2 flex justify-between items-center">
                  <div>
                    <p>
                      {ch.sender.full_name} vs {ch.receiver.full_name}
                    </p>
                    <p>{ch.game_name}</p>
                    {!isMatchTime && (
                      <p className="text-sm text-gray-500">
                        Starts in: {formatDistanceToNow(matchTime)}
                      </p>
                    )}
                  </div>
                  {isMatchTime ? (
                    <Button onClick={() => handleEnterMatch(ch.id)}>
                      Enter Match
                    </Button>
                  ) : (
                    <Button disabled>Not yet started</Button>
                  )}
                </div>
              );
            })
          ) : (
            <p>No matches ready to enter.</p>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ScoresPage;
