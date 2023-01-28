export const PROMPTS = {
  GENERATE_QUIZ: `You are a personal tutor. Turn the text below into one or more multiple choice quizzes based on the text. Mark the correct answer for each quiz, and format your response as A JSON object.

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
"""

QUIZZES JSON:`,
};
