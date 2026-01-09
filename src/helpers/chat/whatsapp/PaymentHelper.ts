// Dependencies
const { interpolation } = require("interpolate-json");
import { evaluate } from "mathjs";
// Constants
import {
  gptPromptsJson,
  paymentInfo,
  ocrConfig,
} from "../../../config/Constants";
// Helpers
import { removeAccents } from "../../FormatString";
import { sendContextMessage } from "./GPTHelper";
import { updatePaidStatus } from "../../DebtorHelper";
// Models
import { Chat } from "../../../models/Chat";
import { CallChat } from "../../../models/CallChat";

function getDatePayment(botPaymentResponse: string) {
  const amountList = botPaymentResponse.match(/\d+/g);
  if (!amountList) {
    throw new Error("No se encontró el monto");
  }
  let amount = Number(amountList[0]);
  let date;
  if (
    paymentInfo["date"]["day"].some((day: string) =>
      botPaymentResponse.includes(day)
    )
  ) {
    date = "dia";
  } else if (
    paymentInfo["date"]["month"].some((month: string) =>
      botPaymentResponse.includes(month)
    )
  ) {
    date = "mes";
  } else if (
    paymentInfo["date"]["year"].some((year: string) =>
      botPaymentResponse.includes(year)
    )
  ) {
    date = "mes";
    amount = amount * 12;
  }
  if (!date) {
    throw new Error("No se encontró la fecha o el monto");
  }
  return {
    date,
    amount,
  };
}

async function getDebtInformation(
  userCellphone: number,
  debtorCellphone: number,
  typeChat: string = "whatsapp"
) {
  const chat = typeChat == "whatsapp" ? Chat : CallChat;
  const chatInfo = await chat.findOne({
    from_cellphone: userCellphone,
    to_cellphone: debtorCellphone,
    message: {
      $regex: "^{",
    },
  });
  if (!chatInfo) {
    throw new Error("No se encontró el chat");
  }
  const indexOfEndBracket = chatInfo.message.indexOf("}") + 1;
  const messageJson = JSON.parse(
    chatInfo.message.substring(0, indexOfEndBracket)
  );
  return messageJson;
}

export async function getMora(
  userCellphone: number,
  debtorCellphone: number,
  typeChat: string = "whatsapp"
) {
  const messageJson = await getDebtInformation(
    userCellphone,
    debtorCellphone,
    typeChat
  );
  const mora = messageJson[ocrConfig["mora"]];
  return Number(mora);
}

function calculatePayment(
  messageJson: Record<string, any>,
  payment: Record<string, any>
) {
  const jsonValues: Record<string, any> = {
    amount: payment.amount,
    date: payment.date,
  };
  for (const key in paymentInfo.payment.payment_columns) {
    jsonValues[key] = Number(
      messageJson[paymentInfo.payment.payment_columns[key]]
    );
  }
  const quota: number = evaluate(
    paymentInfo.payment.payment_formula,
    jsonValues
  );
  return quota;
}

async function sendDebtQuotaMessage(
  quota: number,
  payment: Record<string, any>
) {
  const prompt = interpolation.expand(
    `${gptPromptsJson["prompt_send_debt1"]}`,
    {
      quota: quota.toFixed(2),
      amount: payment.amount,
    }
  );
  return prompt;
}

async function checkMessage(
  botPaymentResponse: string,
  userCellphone: number,
  debtorCellphone: number,
  debtor: any,
  typeChat: string
) {
  if (
    gptPromptsJson["responses_checkers"]["response_debt"].some(
      (confirmationWord: string) =>
        botPaymentResponse.includes(confirmationWord)
    )
  ) {
    const payment = getDatePayment(botPaymentResponse);
    const messageJson = await getDebtInformation(
      userCellphone,
      debtorCellphone,
      typeChat
    );
    const quota = calculatePayment(messageJson, payment);
    const quotaMessage = await sendDebtQuotaMessage(quota, payment);
    return quotaMessage;
  } else if (
    gptPromptsJson["responses_checkers"]["response_no_payment"].some(
      (noPaymentWord: string) => botPaymentResponse.includes(noPaymentWord)
    )
  ) {
    await updatePaidStatus(debtor, "Not paid");
    return "";
  } else if (
    gptPromptsJson["responses_checkers"]["response_identity"].some(
      (identityWord: string) => botPaymentResponse.includes(identityWord)
    )
  ) {
    await updatePaidStatus(debtor, "Contact");
    return "";
  } else {
    return "";
  }
}

export async function getPaymentMessage(
  userCellphone: number,
  debtorCellphone: number,
  historyMessages: Record<string, any>[],
  debtor: any,
  typeChat: string = "whatsapp"
) {
  try {
    const userMessage = gptPromptsJson["prompt_checkers"];
    let botPaymentResponse = await sendContextMessage(
      historyMessages,
      userMessage
    );
    botPaymentResponse = removeAccents(botPaymentResponse.toLowerCase());
    const result = await checkMessage(
      botPaymentResponse,
      userCellphone,
      debtorCellphone,
      debtor,
      typeChat
    );
    return result;
  } catch (error) {
    return "";
  }
}
