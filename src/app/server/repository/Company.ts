import { company } from "@/app/db/schema";
import BaseRepository from "./BaseRepository";

class CompanyRepository extends BaseRepository {
  constructor() {
    super(company)
  }
}

export type CompanyRepositoryType = InstanceType<typeof CompanyRepository>
export default CompanyRepository;