import http from 'node:http';
import { parse as parseUrl } from 'node:url';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Session } from './session';
import { Interface } from 'node:readline/promises';

export const loginWithNotion = async (rl: Interface) => {
  const redirectUri =
    process.env.NOTION_REDIRECT_URI || 'http://localhost:3000/auth/notion/callback';
  const urlObj = new URL(redirectUri);
  const port = parseInt(urlObj.port) || 3000;

  const authURL = `${API_ENDPOINTS.notion.main}${API_ENDPOINTS.notion.oauth}?client_id=${process.env.NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${redirectUri}`;

  console.log('\n--- Notion Authentication ---');
  console.log('1. Visit this URL in your browser:');
  console.log(authURL);

  const getCode = (): Promise<string> => {
    return new Promise((resolve) => {
      const controller = new AbortController();
      const { signal } = controller;

      const server = http.createServer((req, res) => {
        const query = parseUrl(req.url || '', true).query;
        if (query.code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Success!</h1><p>You can close this window and return to the terminal.</p>');
          server.close();
          controller.abort();
          resolve(query.code as string);
        } else {
          res.writeHead(400);
          res.end('<h1>Error</h1><p>Authorization code missing.</p>');
        }
      });

      server.listen(port, () => {
        console.log(`⌛ [Listening for redirect on port ${port}...]`);
      });

      // Fallback: If user manually pastes the code, resolve with it
      rl.question('\n(Alternative) Paste the code here if the auto-redirect fails: ', { signal })
        .then((input) => {
          if (input.trim()) {
            server.close();
            resolve(input.trim());
          }
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Terminal input error:', err.message);
        });
    });
  };

  try {
    let code = await getCode();

    if (code.includes('?code=') || code.includes('&code=')) {
      try {
        const url = new URL(code);
        code = url.searchParams.get('code') || code;
      } catch (e) {
        code = code.split('code=')[1]?.split('&')[0] || code;
      }
    }

    console.log('⌛ Authenticating with Notion...');

    const res = await axios.post(
      `${API_ENDPOINTS.notion.main}${API_ENDPOINTS.notion.token}`,
      {
        grant_type: 'authorization_code',
        code: code.trim(),
        redirect_uri: redirectUri,
      },
      {
        auth: {
          username: process.env.NOTION_CLIENT_ID!,
          password: process.env.NOTION_CLIENT_SECRET!,
        },
      },
    );

    Session.saveToken(res.data.access_token);
    console.log('✅ Logged in successfully.\n');
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
  }
};
