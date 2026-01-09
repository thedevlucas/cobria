// Models
import { User } from "./User";
import { Debtor } from "./Debtor";
import { Cellphone } from "./Cellphone";
import { Telephone } from "./Telephone";
import { debtImages } from "./DebtImage";
import { Company } from "./Company";
import { Cost } from "./Cost"; 
import { PendingMessage } from "./PendingMessage";

// --- DEBTOR & USER ---
User.hasMany(Debtor, { onDelete: "cascade", foreignKey: "id_user" });
Debtor.belongsTo(User, { foreignKey: "id_user" });

// --- DEBTOR & PHONES ---
Debtor.hasMany(Cellphone, { 
    onDelete: "cascade", 
    foreignKey: "id_debtor",
    as: "cellphones" 
});
Cellphone.belongsTo(Debtor, { 
    foreignKey: "id_debtor",
    as: "debtor"
});

Debtor.hasMany(Telephone, { 
    onDelete: "cascade", 
    foreignKey: "id_debtor",
    as: "telephones" 
});
Telephone.belongsTo(Debtor, { 
    foreignKey: "id_debtor",
    as: "debtor"
});

// --- DEBTOR & IMAGES ---
Debtor.hasMany(debtImages, { 
    onDelete: "cascade", 
    foreignKey: "id_debtor",
    as: "images" 
});
debtImages.belongsTo(Debtor, { 
    foreignKey: "id_debtor",
    as: "debtor" 
});


Company.hasMany(User, { foreignKey: "id_company" });
User.belongsTo(Company, { foreignKey: "id_company" });
Company.hasMany(Cost, { foreignKey: "id_company" });
Cost.belongsTo(Company, { foreignKey: "id_company" });
Company.hasMany(PendingMessage, { foreignKey: "company_id" });
PendingMessage.belongsTo(Company, { foreignKey: "company_id" });
User.hasMany(Cost, { foreignKey: "id_company" }); 