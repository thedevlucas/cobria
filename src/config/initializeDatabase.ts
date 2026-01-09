import { database } from "./Database";
import { User } from "../models/User";
import { Debtor } from "../models/Debtor";
import { Cellphone } from "../models/Cellphone";
import { Cost } from "../models/Cost";
import { PendingMessage } from "../models/PendingMessage";
import { Company } from "../models/Company"; 

export const initializeDatabase = async () => {
  try {
    await database.authenticate();
    console.log("✅ Connection to PostgreSQL has been established successfully.");

    await Company.sync({ alter: true });
    await User.sync({ alter: true });
    await Debtor.sync({ alter: true });
    await Cellphone.sync({ alter: true });
    await Cost.sync({ alter: true }); 
    await PendingMessage.sync({ alter: true });

    console.log("✅ All PostgreSQL tables synced successfully");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};