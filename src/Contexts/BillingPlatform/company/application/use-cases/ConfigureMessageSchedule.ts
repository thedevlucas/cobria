import { CompanyRepository } from "../../domain/CompanyRepository";
import { CompanyNotFoundException } from "../../domain/exceptions/CompanyNotFound";
import { MessagesSchedule } from "../../domain/MessagesSchedule";

export class ConfigureMessageScheduling {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: {
    companyId: number;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    timezone: string;
  }) {
    if (!params.startTime || !params.endTime || params.daysOfWeek.length === 0) {
      throw new Error("Datos de horario incompletos");
    }

    const company = await this.companyRepository.findById(params.companyId);

    if (!company) {
      throw new CompanyNotFoundException();
    }

    if (company.schedules.length) {
      // remove current schedules
      company.removeMessagesSchedule();
      await this.companyRepository.removeMessagesSchedule(params.companyId);

      // add new schedule
      for (const dayOfWeek of params.daysOfWeek) {
        const schedule = MessagesSchedule.create({
          companyId: params.companyId,
          dayOfWeek,
          endTime: params.endTime,
          startTime: params.startTime,
          timezone: params.timezone,
        });
        company.addMessagesSchedule(schedule);
      }
      await this.companyRepository.save(company);
      return;
    }

    for (const dayOfWeek of params.daysOfWeek) {
      const schedule = MessagesSchedule.create({
        companyId: params.companyId,
        dayOfWeek,
        endTime: params.endTime,
        startTime: params.startTime,
        timezone: params.timezone,
      });

      company.addMessagesSchedule(schedule);
    }

    await this.companyRepository.save(company);
  }
}
