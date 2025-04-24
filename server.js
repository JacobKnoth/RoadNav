// server.js  (CommonJS – no top-level await)

const express    = require('express');
const { execFile } = require('child_process');
const fs         = require('fs');
const path       = require('path');

const PORT = 3000;

/*─── absolute paths so we never get the wrong folder ───*/
const ROOT     = __dirname;                             // …/projecttest
const BIN      = path.join(ROOT, 'osm', 'out', 'osmiumtest');   // your exporter
const PBF_FILE = path.join(ROOT, 'osm', 'test2.osm');           // or planet.pbf
const WORKDIR  = path.join(ROOT, 'out');                        // csv output
const PUBDIR   = path.join(ROOT, 'public');                     // static files

console.log({ BIN, PBF_FILE, WORKDIR, PUBDIR });       // log them once

/*─── make sure out/ exists ───*/
fs.mkdirSync(WORKDIR, { recursive: true });

const app = express();

/*─── /way/:id route ───*/
app.get('/way/:id', (req, res) => {
  const wayId   = req.params.id;
  const outFile = path.join(WORKDIR, `way_${wayId}.csv`);

  console.log('⇢  exporting', wayId);
  execFile(BIN, [PBF_FILE, wayId], (err, _stdout, stderr) => {
    if (err) {
      console.error('exporter failed:', stderr.trim());
      return res.status(500).send('exporter failed');
    }
    fs.readFile(outFile, 'utf8', (rErr, csv) => {
      if (rErr) {
        console.error('read error:', rErr.message);
        return res.status(404).send('way not found');
      }
      res.type('text/csv').send(csv);
      console.log('⇠  served', path.basename(outFile));
    });
  });
});

/*─── static files ───*/
app.use(express.static(PUBDIR));

app.listen(PORT, () =>
  console.log(`Listening on http://localhost:${PORT}  (Ctrl-C to stop)`));
