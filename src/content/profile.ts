export const profile = {
  name: 'Harsh Vardhan',
  surname: 'Singh',
  role: 'Machine learning, backend and cloud engineer',
  tagline: 'I build software from the model down to the machine it runs on.',
  about: 'CS graduate, AI specialization. Previously at EPAM Systems, Red Panda Games and Zebpay.',
  email: 'harshthakur9415@gmail.com',
  github: 'https://github.com/HarshVardhanSinghThakur',
  linkedin: 'https://www.linkedin.com/in/harsh-vardhan-singh',
}

export const chapters = [
  { id: 'start', label: 'Start' },
  { id: 'sky', label: 'Sky' },
  { id: 'ground', label: 'Ground' },
  { id: 'roots', label: 'Roots' },
  { id: 'hello', label: 'Hello' },
]

// x and y are percentages of the constellation stage
export const stars = [
  {
    label: 'Reading the market',
    where: 'Zebpay, Mar to May 2024',
    text: 'An LSTM that predicts BTC price behind a FastAPI endpoint, plus tools for evaluating trading strategies. Separately, a Random Forest trading system backtested on six years of data.',
    x: 10,
    y: 62,
  },
  {
    label: 'Ask your database',
    where: 'Personal project, DataAI',
    text: 'LangChain and a Groq-hosted model that write schema-aware SQL for MySQL, and run MongoDB operations, from plain-language questions.',
    x: 30,
    y: 26,
  },
  {
    label: 'Three models, one face',
    where: 'Personal project, MoodE',
    text: 'A React and Express app that runs three Hugging Face models in parallel on every photo and merges the answers. Frontend on Vercel, CORS-secured Node backend.',
    x: 50,
    y: 66,
  },
  {
    label: 'Text to game worlds',
    where: 'Red Panda Games, Aug to Dec 2025',
    text: 'A pipeline that turns a text prompt into 2D and 3D game assets with SDXL and Hunyuan3D on AWS GPU instances, with scripted batches for terrain, vegetation and props.',
    x: 72,
    y: 30,
  },
  {
    label: 'Top 1%',
    where: 'IIT Kharagpur Data Science Hackathon',
    text: 'Top 1% of more than 1,000 participants with an ensemble model. An earlier Delhi University hackathon win, a crypto recommender, is what led to the Zebpay internship.',
    x: 90,
    y: 64,
  },
]

export const services = [
  {
    title: 'Inference',
    text: 'FastAPI endpoints that put a model in front of real traffic: price prediction at Zebpay, asset generation at Red Panda.',
    drop: 0,
  },
  {
    title: 'Interfaces',
    text: 'React on the front, Node and Express behind it, so a model’s answer becomes something a person can use.',
    drop: 36,
  },
  {
    title: 'Data',
    text: 'PostgreSQL, MySQL and MongoDB for records, S3 for files.',
    drop: 14,
  },
]
