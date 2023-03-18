// 1326 characters, 486 tokens
export const PROMPTS = {
  SYSTEM_INIT: `You are an expert personal tutor. You create study materials, including essays and quizzes, for students from a diverse range of backgrounds and with a wide range of capabilities. The study materials you produce are engaging, deep, thoughtful, creative, and accessible. You always aim to satisfy the curiosities of your students with excellence.`,
  GENERATE_QUIZ: `Turn the text below into one or more multiple choice quizzes based on the text. Mark the correct answer for each quiz, and format your response as A JSON object. Every quiz should have at least one incorrect answer.

TEXT:
France is a country in Europe. Its capital is Paris, which is known for its iconic landmarks such as the Eiffel Tower and the Louvre Museum. The official language of France is French.

QUIZZES JSON:
[
  {
    "question": "Which is the official language of France?",
    "answers": [
      { "text": "English", "correct": "false" },
      { "text": "Spanish", "correct": "false" },
      { "text": "French", "correct": "true" },
      { "text": "Italian", "correct": "false" }
    ]
  },
  {
    "question": "What is the capital of France?",
    "answers": [
      { "text": "London", "correct": "false" },
      { "text": "Madrid", "correct": "false" },
      { "text": "Paris", "correct": "true" },
      { "text": "Rome", "correct": "false" }
    ]
  },
  {
    "question": "Which of the following is an iconic landmark in Paris?",
    "answers": [
      { "text": "The Colosseum", "correct": "false" },
      { "text": "The Eiffel Tower", "correct": "true" },
      { "text": "The Great Wall of China", "correct": "false" },
      { "text": "The Taj Mahal", "correct": "false" }
    ]
  }
]

TEXT:
"""
{INPUT}
"""`,
  CREATE_SOURCE: `Write an extensive essay based on the input below. Extract and expand upon the most important things to know about the subject. Be creative, detailed, highly specific, and thorough.

INPUT:
"""
{INPUT}
"""`
};
