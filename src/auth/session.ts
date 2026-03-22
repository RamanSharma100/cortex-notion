import fs from 'node:fs';

const SESSION_FILE = '.notion-session.json';

export class Session {
  private static getStore = () => {
    if (!fs.existsSync(SESSION_FILE)) return {};
    try {
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    } catch {
      return {};
    }
  };

  private static saveStore = (data: any) => {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  };

  static saveToken = (token: string) => {
    const store = Session.getStore();
    Session.saveStore({ ...store, token });
  };

  static getToken = (): string | null => {
    return Session.getStore().token || null;
  };

  static saveAIKey = (key: string) => {
    const store = Session.getStore();
    Session.saveStore({ ...store, aiKey: key });
  };

  static getAIKey = (): string | null => {
    return Session.getStore().aiKey || process.env.OPENAI_API_KEY || null;
  };

  static saveGeminiKey = (key: string) => {
    const store = Session.getStore();
    Session.saveStore({ ...store, geminiKey: key });
  };

  static getGeminiKey = (): string | null => {
    return Session.getStore().geminiKey || process.env.GEMINI_API_KEY || null;
  };

  static clear = () => {
    if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
  };
}
