import { Company } from "./Company";

export class MessagesSchedule {
  id!: number;
  company_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  company!: Company;
  readonly createdAt!: Date;
  updatedAt!: Date;

  constructor(
    company_id: number,
    day_of_week: number,
    start_time: string,
    end_time: string,
    timezone: string
  ) {
    this.company_id = company_id;
    this.day_of_week = day_of_week;
    this.start_time = start_time;
    this.end_time = end_time;
    this.timezone = timezone;
  }

  static create(params: {
    companyId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
  }): MessagesSchedule {
    return new MessagesSchedule(
      params.companyId,
      params.dayOfWeek,
      params.startTime,
      params.endTime,
      params.timezone
    );
  }

  static fromPrimitives(plainData: {
    companyId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
  }) {
    return new MessagesSchedule(
      plainData.companyId,
      plainData.dayOfWeek,
      plainData.startTime,
      plainData.endTime,
      plainData.timezone
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      company_id: this.company_id,
      day_of_week: this.day_of_week,
      start_time: this.start_time,
      end_time: this.end_time,
      timezone: this.timezone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
