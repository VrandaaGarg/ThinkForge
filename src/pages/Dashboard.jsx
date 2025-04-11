import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLearningPaths, getUserProgress } from "../config/database";
import { account } from "../config/appwrite";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [quizScores, setQuizScores] = useState([]);

  useEffect(() => {
    fetchUserProgress();
    fetchPaths();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const user = await account.get(); // Get logged-in user
      const progress = await getUserProgress(user.$id); // Fetch progress

      setFlashcardCount(progress.flashcardCount || 0);

      // Ensure quizScores is safely parsed
      let parsedQuizScores = [];
      if (progress.quizScores) {
        try {
          parsedQuizScores = Array.isArray(progress.quizScores)
            ? progress.quizScores // If already an array, use it directly
            : JSON.parse(progress.quizScores); // Otherwise, parse it
        } catch (error) {
          console.error("Error parsing quizScores JSON:", error);
        }
      }

      setQuizScores(parsedQuizScores);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  const fetchPaths = async () => {
    try {
      const user = await account.get();
      const response = await getLearningPaths(user.$id);

      // Filtering paths where progress is less than 100
      const incompletePaths = response.documents.filter(
        (path) => path.progress < 100
      );

      setPaths(incompletePaths);
    } catch (error) {
      console.error("Error fetching paths:", error);
    }
  };

  const calculateSuccessRate = () => {
    if (!quizScores.length) return 0; // Avoid division by zero

    const totalAccuracy = quizScores.reduce(
      (sum, score) => sum + parseFloat(score.accuracy),
      0
    );

    return (totalAccuracy / quizScores.length).toFixed(2); // Average accuracy
  };

  const cards = [
    {
      title: "Continue Learning",
      description: "Resume your learning journey",
      icon: "📚",
      color: "from-purple-500 to-purple-600",
      path: "/learning-path",
      stats: `${
        paths.filter((path) => path.progress < 100).length
      } paths in progress`, // ✅ Fix: Remove extra {}
    },

    {
      title: "Flashcards",
      description: "Practice with your decks",
      icon: "🗂️",
      color: "from-indigo-500 to-indigo-600",
      path: "/flashcards",
      stats: `${flashcardCount} cards mastered`,
    },
    {
      title: "Quiz Performance",
      description: "Track your quiz scores",
      icon: "📊",
      color: "from-violet-500 to-violet-600",
      path: "/quiz",
      stats: `${calculateSuccessRate()}% success rate`,
    },
  ];

  const quickActions = [
    { icon: "🎯", label: "New Learning Path", path: "/learning-path" },
    { icon: "🗂️", label: "Create Flashcards", path: "/flashcards" },
    { icon: "📝", label: "Take Quiz", path: "/quiz" },
    { icon: "📈", label: "View Progress", path: "/progress" },
  ];

  return (
    <div className="flex-1 max-w-full p-2 md:p-6 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white shadow-lg"
        >
          <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(" ")[0] || "Learner"}! 👋
          </h1>
          <p className="text-purple-100">
            Ready to continue your learning journey?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              onClick={() => navigate(action.path)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-2 md:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(card.path)}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="text-3xl mb-4">{card.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {card.title}
              </h2>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                {card.stats}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
