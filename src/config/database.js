import { Client, Databases, Query, ID } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

export const createLearningPath = async (userId, topicName, modules) => {
  try {
    return await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_COLLECTION_ID,
      ID.unique(),
      {
        userID: userId,
        topicName,
        modules: JSON.stringify(modules), // Convert array to string
        progress: 0,
        completedModules: JSON.stringify([]), // Initialize as empty array
      }
    );
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create learning path in database");
  }
};

export const getLearningPaths = async (userId) => {
  try {
    const response = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_COLLECTION_ID,
      [Query.equal("userID", userId)]
    );

    // Parse modules string back to array for each document
    return {
      ...response,
      documents: response.documents.map((doc) => ({
        ...doc,
        modules: JSON.parse(doc.modules),
        completedModules: JSON.parse(doc.completedModules || '[]'), // Parse completedModules
      })),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch learning paths");
  }
};

export const updateLearningPathProgress = async (pathId, progress) => {
  try {
    return await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_COLLECTION_ID,
      pathId,
      {
        progress: Math.min(progress, 100), // Ensure progress doesn't exceed 100
      }
    );
  } catch (error) {
    console.error("Progress update error:", error);
    throw new Error("Failed to update progress");
  }
};

export const deleteLearningPath = async (pathId) => {
  try {
    await databases.deleteDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_COLLECTION_ID,
      pathId
    );
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete learning path");
  }
};

export const updateUserProgress = async (userId, data) => {
  try {
    const response = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      "user_progress",
      [Query.equal("userID", userId)]
    );

    if (response.documents.length > 0) {
      const doc = response.documents[0];
      return await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        "user_progress",
        doc.$id,
        {
          userID: userId,
          topicName: data.topicName || doc.topicName,
          quizScores: data.quizScores
            ? JSON.stringify([
                ...JSON.parse(doc.quizScores || "[]"),
                data.quizScores,
              ])
            : doc.quizScores,
          flashcardCount: data.flashcardCount
            ? parseInt(doc.flashcardCount || 0) + data.flashcardCount
            : doc.flashcardCount,
        }
      );
    } else {
      return await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        "user_progress",
        ID.unique(),
        {
          userID: userId,
          topicName: data.topicName || "",
          quizScores: data.quizScores
            ? JSON.stringify([data.quizScores])
            : "[]",
          flashcardCount: data.flashcardCount || 0,
        }
      );
    }
  } catch (error) {
    console.error("Progress update error:", error);
    throw error;
  }
};

export const getFlashcardCount = async (userId) => {
  try {
    const response = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      "user_progress",
      [Query.equal("userID", userId)]
    );

    if (response.documents.length > 0) {
      return response.documents[0].flashcardCount || 0; // Return count or default to 0
    } else {
      return 0; // Default if no user progress is found
    }
  } catch (error) {
    console.error("Error fetching flashcard count:", error);
    return 0;
  }
};

export const getUserProgress = async (userId) => {
  try {
    const response = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      "user_progress",
      [Query.equal("userID", userId)]
    );

    if (response.documents.length > 0) {
      const doc = response.documents[0];
      return {
        flashcardCount: doc.flashcardCount || 0,
        quizScores: doc.quizScores ? JSON.parse(doc.quizScores) : [], // Parse JSON string
      };
    } else {
      return {
        flashcardCount: 0,
        quizScores: [],
      };
    }
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return { flashcardCount: 0, quizScores: [] };
  }
};

export const markModuleComplete = async (pathId, moduleIndex) => {
  try {
    const doc = await databases.getDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_COLLECTION_ID,
      pathId
    );

    const completedModules = JSON.parse(doc.completedModules || '[]');
    if (!completedModules.includes(moduleIndex)) {
      completedModules.push(moduleIndex);
    }

    return await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_COLLECTION_ID,
      pathId,
      {
        completedModules: JSON.stringify(completedModules),
        progress: Math.round((completedModules.length / JSON.parse(doc.modules).length) * 100)
      }
    );
  } catch (error) {
    console.error('Module completion update error:', error);
    throw error;
  }
};
