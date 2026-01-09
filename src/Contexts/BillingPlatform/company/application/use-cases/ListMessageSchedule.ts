import { CompanyRepository } from "../../domain/CompanyRepository";

export class ListMessageSchedule {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: { idCompany: number }) {
    const { idCompany } = params;

    const messageSchedules = await this.companyRepository.listMessageSchedule(
      idCompany
    );

    if (!messageSchedules.length) {
      return null;
    }

    const daysOfWeek: number[] = [];

    messageSchedules.forEach((element) => {
      daysOfWeek.push(element.day_of_week);
    });

    const formattedSchedule = {
      startTime: messageSchedules[0].start_time,
      endTime: messageSchedules[0].end_time,
      daysOfWeek: daysOfWeek,
      timezone: messageSchedules[0].timezone,
    };

    return formattedSchedule;
  }
}
