require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit  = require('express-rate-limit');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://jwt-79xc2u40y-pro-base-7416s-projects.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Ko\'p urinish. 15 daqiqadan keyin qayta urining.' }
});

app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api',      require('./src/routes/user'));

app.get('/', (req, res) => {
  res.json({ message: 'Server ishlamoqda' });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server ${PORT} portda ishlamoqda`));
}

module.exports = app;