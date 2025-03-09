const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;
const API_BASE_URL = 'http://rnayd-103-27-167-96.a.free.pinggy.link/';

app.use(cors());
app.use(express.json());

// Fetch health scores
app.get('/get-scores/', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}get-scores/`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching health scores:', error);
    res.status(500).json({
      activityScore: 0,
      dietScore: 0,
      healthScore: 0,
      sleepScore: 0,
    });
  }
});

// Submit a meal photo for evaluation
app.post('/evaluate-meal/', async (req, res) => {
  try {
    const { saved_face, test_face, meal } = req.body;

    const response = await fetch(`${API_BASE_URL}evaluate-meal/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ saved_face, test_face, meal }),
    });

    let authorized = await response.text();
    isSame = JSON.parse(authorized);
    console.log(isSame);
    res.status(response.ok ? 200 : 500).json({ success: response.ok });
  } catch (error) {
    console.error('Error evaluating meal photo:', error);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// const http = require('http');
// const url = require('url');
// const fetch = require('node-fetch');

// const PORT = 3000;
// const API_BASE_URL = 'http://rnayd-103-27-167-96.a.free.pinggy.link/';

// // Helper function to handle CORS headers
// const setCorsHeaders = (res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
// };

// // Helper function to read request body data
// const readRequestBody = (req) => {
//   return new Promise((resolve, reject) => {
//     let body = '';
//     req.on('data', (chunk) => {
//       body += chunk.toString();
//     });
//     req.on('end', () => {
//       try {
//         resolve(body ? JSON.parse(body) : {});
//       } catch (error) {
//         reject(error);
//       }
//     });
//     req.on('error', (error) => {
//       reject(error);
//     });
//   });
// };

// const server = http.createServer(async (req, res) => {
//   // Set CORS headers for all responses
//   setCorsHeaders(res);

//   // Handle preflight OPTIONS requests for CORS
//   if (req.method === 'OPTIONS') {
//     res.writeHead(204);
//     res.end();
//     return;
//   }

//   const parsedUrl = url.parse(req.url, true);
//   const pathname = parsedUrl.pathname;

//   // GET endpoint to fetch health scores
//   if (req.method === 'GET' && pathname === '/get-scores/') {
//     try {
//       const response = await fetch(`${API_BASE_URL}get-scores/`);
//       const data = await response.json();

//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(data));
//     } catch (error) {
//       console.error('Error fetching health scores:', error);
//       res.writeHead(500, { 'Content-Type': 'application/json' });
//       res.end(
//         JSON.stringify({
//           healthyDietPoints: 0,
//           healthyActivityPoints: 0,
//           foodPoints: 0,
//           healthySleepPoints: 0,
//         })
//       );
//     }
//   }
//   // POST endpoint to evaluate meal photos
//   else if (req.method === 'POST' && pathname === '/evaluate-meal/') {
//     try {
//       const requestBody = await readRequestBody(req);
//       const { savedFace, testFace, meal } = requestBody;

//       const response = await fetch(`${API_BASE_URL}evaluate-meal/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ saved_face: savedFace, test_face: testFace, meal }),
//       });

//       const success = response.ok;

//       res.writeHead(success ? 200 : 500, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ success }));
//     } catch (error) {
//       console.error('Error evaluating meal photo:', error);
//       res.writeHead(500, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ success: false }));
//     }
//   }
//   // Handle invalid routes
//   else {
//     res.writeHead(404, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({ error: 'Not Found' }));
//   }
// });

// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
