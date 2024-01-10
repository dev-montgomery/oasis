const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post('/playerdata', async (req, res) => {
  const filePath = path.join(__dirname, 'assets/player_data', 'player.json');
  const updatedData = JSON.stringify(req.body, null, 2);
  
  try {
    await fs.writeFile(filePath, updatedData);
    res.json({ success: true, message: 'Player data saved successfully.' })
  } catch(error) {
    console.error('Error saving player data:', error);
    res.status(500).json({ success: false, message: 'Failed to save player data.' });
  };
});

app.listen(PORT, () => {
  console.log('\x1b[33m', `Server running on http://localhost:${PORT}.`, '\x1b[0m');
});