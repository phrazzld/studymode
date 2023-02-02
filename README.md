# studymode
> Learn smarter, not harder.

studymode is a learning application. Enter some text, and studymode will generate relevant quizzes for you. Take your quizzes any time to review and cement your knowledge.

## Roadmap

There's a lot we want to do with studymode, and things are changing faster than ever, so there is no guarantee this roadmap is up-to-date. But broad strokes on features we're working towards:

### Longform sources

studymode currently works best with relatively short text sources. We would very much like it to work with longform content.

### References as sources

Copying and pasting the text you want to generate quizzes from can be a point of friction. Ideally you could just say "college level introductory chemistry" or "The Odyssey" and get a stack of high-quality quizzes.

### Personalized review schedule

Reviewing whatever quizzes you want whenever you want is fine, but ideally users would be prompted to review specific material only when they absolutely needed to in order to maximize retention. Instead of combing through piles of quizzes trying to remember what you need to remember, you should be able to take the quizzes we push you and be confident you'll remember everything you want.

### Take learning goals into account

Given a blob of text, there's only so much we can do to determine what's important for you to remember and what's not. Seeding the quiz generation request with some learning goals could help improve the quality and relevance of generated quizzes from source materials.

## Technologies

- Next.js 13
- Firebase
- Tailwind CSS
- OpenAI GPT API
- Deployed with Vercel
