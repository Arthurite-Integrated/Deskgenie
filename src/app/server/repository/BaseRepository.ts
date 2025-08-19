import { PgTableWithColumns } from "drizzle-orm/pg-core";
import { CE_INTERNAL_SERVER } from "../../utils/Error";
import { eq } from "drizzle-orm";
import db from "../../db";
import { Repository } from "../../types/repository.type";

export default class BaseRepository implements Repository {
  constructor(private model: PgTableWithColumns<any>) {}

  async create(data: object) {
    try {
      console.log(data)
      const result = await db.insert(this.model).values(data).returning();
      return result[0];
    } catch (e: Error | unknown) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e));
    }
  }

  async createMany(data: object[]) {
    try {
      const result = await db.insert(this.model).values(data).returning();
      return result;
    } catch (e) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e));
    }
  }

  async readOneById(id: string) {
    try {
      const findOne = await db .select() .from(this.model) .where(eq(this.model.id, id));
      return findOne?.[0];
    } catch (e) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e));
    }
  }

  async readOneByEmail(email: string) {
    try {
      const findOne = await db
        .select()
        .from(this.model)
        .where(eq(this.model.email, email));
      return findOne[0];
    } catch (e) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e));
    }
  }

  async readAll() {
    try {
      const findOne = await db.select().from(this.model);
      return findOne;
    } catch (e) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e));
    }
  }

  async update(id: string, data: any) {
    try {
      const update = await db
        .update(this.model)
        .set(data)
        .where(eq(this.model.id, id))
        .returning();
      return update[0];
    } catch (e) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e));
    }
  }
  
  async delete(id: string) {
    try {
      await db.delete(this.model).where(eq(this.model.id, id));
      return { success: true, id };
    } catch (e) {
      throw CE_INTERNAL_SERVER(e instanceof Error ? e.message : String(e));
    }
  }
}
