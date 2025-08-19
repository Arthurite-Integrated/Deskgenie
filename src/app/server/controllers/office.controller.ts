import { CREATED } from "@/app/utils/Response";
import CompanyRepository, { CompanyRepositoryType } from "../repository/Company";

class CompanyController {
  private companyRepository: CompanyRepositoryType;

  constructor() {
    this.companyRepository = new CompanyRepository()
  }

  async create(data: { name: string, description: string }) {
    const { name, description } = data;
    const create_company = await this.companyRepository.create({ name, description })
    return CREATED('Company created successfully', create_company)
  }
}

export default CompanyController;