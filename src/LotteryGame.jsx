import React, { useState, useEffect } from "react";
import "./LotteryGame.css";
import Confetti from "react-confetti";
import FlipNumbers from "react-flip-numbers";

const LotteryGame = () => {
  const [lotteryNumber, setLotteryNumber] = useState(null);
  const [winMessage, setWinMessage] = useState({ msg: "" });
  const [chances, setChances] = useState(5);
  const [pastWinnings, setPastWinnings] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const storedWinnings =
      JSON.parse(localStorage.getItem("pastWinnings")) || [];
    setPastWinnings(storedWinnings);

    const storedChances = JSON.parse(localStorage.getItem("chances"));
    const lastResetTime = JSON.parse(localStorage.getItem("lastResetTime"));

    if (storedChances !== null) {
      setChances(storedChances);
    }

    if (lastResetTime) {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - lastResetTime;

      if (timeDifference >= 3600000) {
        resetChances();
      } else {
        setTimeLeft(3600000 - timeDifference);
      }
    } else {
      localStorage.setItem(
        "lastResetTime",
        JSON.stringify(new Date().getTime())
      );
    }
  }, []);

  useEffect(() => {
    if (chances === 0 && timeLeft === null) {
      const currentTime = new Date().getTime();
      const nextReset = currentTime + 3600000;
      localStorage.setItem("lastResetTime", JSON.stringify(nextReset));
      setTimeLeft(3600000);
    }
  }, [chances]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(timer);
            resetChances();
            return null;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const resetChances = () => {
    setChances(5);
    localStorage.setItem("chances", JSON.stringify(5));
    localStorage.setItem("lastResetTime", JSON.stringify(new Date().getTime()));
    setTimeLeft(null);
  };

  const isWin = (lotteryNumber) => {
    if (!lotteryNumber) return;
    let sumOfLotteryNumber = 0;
    const winningNumber = 15;
    const temp = lotteryNumber.toString().split("").map(Number);
    temp.forEach((num) => (sumOfLotteryNumber += num));

    if (sumOfLotteryNumber === winningNumber) {
      setWinMessage({ msg: "🎉 Congratulations! You won the lottery! 🎉" });

      const updatedWinnings = [...pastWinnings, lotteryNumber];
      setPastWinnings(updatedWinnings);
      localStorage.setItem("pastWinnings", JSON.stringify(updatedWinnings));
    } else {
      setWinMessage({
        msg: `❌ Better luck next time! Chances left: ${chances - 1}`,
      });
    }
  };

  const getLotteryTicket = () => {
    if (chances <= 0) return;

    setWinMessage({ msg: "" });
    const lotteryNumber = Math.floor(100 + Math.random() * 900);
    setLotteryNumber(lotteryNumber);
    isWin(lotteryNumber);

    setChances((prevChances) => {
      const newChances = prevChances - 1;
      localStorage.setItem("chances", JSON.stringify(newChances));
      return newChances;
    });
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="lottery-container">
      {winMessage.msg.includes("Congratulations") && <Confetti />}

      <h1>Lottery Game</h1>
      <h2
        className={
          winMessage.msg.includes("Congratulations")
            ? "win-message"
            : "lose-message"
        }
      >
        {winMessage.msg}
      </h2>

      {lotteryNumber === null ? (
        <h3>Click Below Button to get the Lottery Number</h3>
      ) : (
        <FlipNumbers
          height={40}
          width={30}
          color="white"
          background="black"
          play
          numbers={lotteryNumber.toString()}
        />
      )}

      <button
        className="lottery-button"
        onClick={getLotteryTicket}
        disabled={chances === 0}
      >
        {chances > 0 ? "Get new Ticket" : "No More Chances"}
      </button>

      {chances === 0 && timeLeft !== null && (
        <h3>New chances in: {formatTime(timeLeft)}</h3>
      )}

      {pastWinnings.length > 0 && (
        <div>
          <h3>Past Winnings:</h3>
          <p>{pastWinnings.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default LotteryGame;
