import moment from "moment-timezone";
import { ListMessageSchedule } from "../../../company/application/use-cases/ListMessageSchedule";

export class ValidateScheduleConfig {
  constructor(private readonly listMessageSchedule: ListMessageSchedule) {}

  async run(params: { idCompany: number }): Promise<boolean> {
    const { idCompany } = params;

    const schedule = await this.listMessageSchedule.run({ idCompany });

    if (!schedule) {
      return false;
    }

    if (!schedule.daysOfWeek.length) {
      throw new Error("No se ha configurado horario de mensajes");
    }

    const now = moment().tz(schedule.timezone);
    const currentDay = now.day();
    const currentTime = now.format("HH:mm");

    console.log(
      `⏳ Hora actual en ${schedule.timezone}: ${currentTime} - Día: ${currentDay}`
    );

    if (!this.isDayOfWeek(currentDay, schedule.daysOfWeek)) {
      console.log("❌ Hoy no es un día permitido para enviar mensajes.");
      return false;
    }

    const startTime = moment(schedule.startTime, "HH:mm");
    const endTime = moment(schedule.endTime, "HH:mm");
    const formattedNowTime = moment(currentTime, "HH:mm");

    console.log("startTime", startTime);
    console.log("endTime", endTime);
    console.log("formattedNowTime", formattedNowTime);

    if (startTime.isSame(formattedNowTime)) {
      console.log("✅ La hora actual es igual al horario de inicio.");
      return true;
    }

    if (endTime.isSame(formattedNowTime)) {
      console.log("✅ La hora actual es igual al horario de fin.");
      return true;
    }

    // Verificar si la hora actual está dentro de las horas permitidas
    const isAllowedHour = formattedNowTime.isBetween(startTime, endTime);

    console.log("isAllowedHour", isAllowedHour);

    if (!isAllowedHour) {
      console.log("❌ La hora actual no está dentro del rango permitido.");
      return false;
    }

    console.log("✅ Mensaje dentro del horario permitido. Puede enviarse.");
    return true;
  }

  private isDayOfWeek(day: number, daysOfWeek: number[]): boolean {
    return daysOfWeek.includes(day);
  }

  private isTime(
    startTime: string,
    endTime: string,
    timeToCompare: number
  ): boolean {
    let realEndTime = endTime;
    let realStartTime = startTime;

    if (realStartTime == "00") realStartTime = "24";
    if (realEndTime == "00") realEndTime = "24";

    return (
      timeToCompare >= Number(realStartTime) &&
      timeToCompare <= Number(realEndTime)
    );
  }
}
