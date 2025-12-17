
import { Bot, User, Channel, CryptoTransaction } from '../types';
import { mockBots } from '../data';

const STORAGE_KEYS = {
  BOTS: 'db_bots_v3',
  USERS: 'db_users_v3',
  CHANNELS: 'db_channels_v3',
  TRANSACTIONS: 'db_transactions_v3',
  ADMIN_AUTH: 'db_admin_session'
};

export class DatabaseService {
  // --- Initialize DB with seed data if empty ---
  static async init() {
    if (!localStorage.getItem(STORAGE_KEYS.BOTS)) {
      localStorage.setItem(STORAGE_KEYS.BOTS, JSON.stringify(mockBots));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const initialUsers = [
        { id: '1', name: 'Admin User', username: 'admin', role: 'Admin', status: 'Active', badges: ['Premium'], joinDate: new Date().toISOString() }
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    }
  }

  // --- Bots ---
  static async getBots(): Promise<Bot[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOTS) || '[]');
  }

  static async saveBot(bot: Bot) {
    const bots = await this.getBots();
    const index = bots.findIndex(b => b.id === bot.id);
    if (index > -1) bots[index] = bot;
    else bots.push(bot);
    localStorage.setItem(STORAGE_KEYS.BOTS, JSON.stringify(bots));
  }

  static async deleteBot(id: string) {
    const bots = await this.getBots();
    const filtered = bots.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOTS, JSON.stringify(filtered));
  }

  // --- Users ---
  static async getUsers(): Promise<User[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  static async updateUser(user: User) {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) users[index] = user;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // --- Transactions ---
  static async getTransactions(): Promise<CryptoTransaction[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  }

  static async addTransaction(tx: CryptoTransaction) {
    const txs = await this.getTransactions();
    txs.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  }

  // --- Admin Auth ---
  static setAdminSession(token: string) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, token);
  }

  static isAdminLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
  }

  static logoutAdmin() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }
}
