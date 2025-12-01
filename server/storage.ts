import {
  users,
  favorites,
  subscriptions,
  type User,
  type UpsertUser,
  type InsertFavorite,
  type Favorite,
  type Subscription,
  type InsertSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User | undefined>;
  getFavorites(userId: string): Promise<Favorite[]>;
  getFavorite(id: number, userId: string): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number, userId: string): Promise<boolean>;
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(userId: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  updateSubscriptionByStripeId(stripeSubscriptionId: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First check if a user with this email already exists (handles migration from old auth)
    if (userData.email) {
      const [existingUserByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));
      
      if (existingUserByEmail && existingUserByEmail.id !== userData.id) {
        // Update existing user with new Clerk ID and data
        const [updatedUser] = await db
          .update(users)
          .set({
            id: userData.id,
            firstName: userData.firstName ?? existingUserByEmail.firstName,
            lastName: userData.lastName ?? existingUserByEmail.lastName,
            profileImageUrl: userData.profileImageUrl ?? existingUserByEmail.profileImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();
        return updatedUser;
      }
    }
    
    // Normal upsert by ID
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async getFavorite(id: number, userId: string): Promise<Favorite | undefined> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(eq(favorites.id, id));
    if (favorite && favorite.userId === userId) {
      return favorite;
    }
    return undefined;
  }

  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values(favoriteData)
      .returning();
    return favorite;
  }

  async deleteFavorite(id: number, userId: string): Promise<boolean> {
    const favorite = await this.getFavorite(id, userId);
    if (!favorite) {
      return false;
    }
    await db.delete(favorites).where(eq(favorites.id, id));
    return true;
  }

  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(subscriptionData)
      .returning();
    return subscription;
  }

  async updateSubscription(userId: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return subscription;
  }

  async updateSubscriptionByStripeId(stripeSubscriptionId: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .returning();
    return subscription;
  }
}

export const storage = new DatabaseStorage();
