import { ULID } from "ulid";

export interface Repository {
  create(data: object): Promise<object>;
  createMany(data: object[]): Promise<object[]>;
  readOneById(id: ULID): Promise<{}>;
  readOneByEmail(email: string): Promise<{}>
  readAll(): Promise<any[]>
  update(id: ULID, data: object): Promise<{}>
  delete(id: ULID): Promise<{ success: boolean, id: ULID}>
}