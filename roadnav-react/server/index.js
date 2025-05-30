import express  from 'express';
import mongoose from 'mongoose';
import cors     from 'cors';
import 'dotenv/config';          // .env → process.env

// ───────────────────────────────────────────────────────────── schema
const RouteSchema = new mongoose.Schema(
  {
    from        : { type: [Number], required: true },  // [lat, lon]
    to          : { type: [Number], required: true },
    profile     : { type: String,  required: true },   // motorcycle / auto / bicycle
    encoded     : { type: String,  required: true },   // polyline6
    trip        : { type: Object,  required: true },   // full Valhalla trip blob
    createdAt   : { type: Date,    default: Date.now }
  },
  { collection: 'routes' }
);

const Route = mongoose.model('Route', RouteSchema);

// ───────────────────────────────────────────────────────────── app
const app = express();
app.use(cors());
app.use(express.json());

// POST /api/routes  → save one route
app.post('/api/routes', async (req, res) => {
  try {
    const { from, to, profile, encoded, trip } = req.body;
    const doc = await Route.create({ from, to, profile, encoded, trip });
    res.status(200).json({ _id: doc._id });
  } catch (err) {
    console.error('saveRoute error:', err);
    res.status(500).json({ error: 'Could not save route' });
  }
});

// (optional) GET /api/routes  → list recent
app.get('/api/routes', async (_req, res) => {
  const routes = await Route.find().sort({ createdAt: -1 }).limit(20);
  res.json(routes);
});

// ───────────────────────────────────────────────────────────── start
const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGO_URL)          // e.g. "mongodb://localhost:27017/valhalla"
  .then(() => app.listen(PORT, () => console.log(`API on :${PORT}`)))
  .catch((e) => console.error('Mongo connection failed', e));
