// Dependencies
import { Request, Response, NextFunction } from 'express';
import { ZodError, AnyZodObject } from 'zod';

const fieldTranslations: Record<string, string> = {
  // Campos de Usuario / Registro
  name: "Nombre",
  email: "Correo electrónico",
  password: "Contraseña",
  companyName: "Nombre de la empresa",
  isCollectionCompany: "Tipo de empresa",
  role: "Rol de usuario",
  active: "Estado de cuenta",
  cellphone: "Celular",
  telephone: "Teléfono fijo",
  oldPassword: "Contraseña actual",
  newPassword: "Nueva contraseña",

  // Campos de Deudores (DebtorSchema)
  document: "DNI / Documento",
  address: "Dirección",
  city: "Ciudad",
  debtAmount: "Monto de la deuda",
  dueDate: "Fecha de vencimiento",
  
  // Campos de Configuración / Otros
  type: "Tipo",
  description: "Descripción",
  amount: "Monto"
};

// Validator
export const validate = (schema: AnyZodObject, typeData: 'body' | 'query' | 'params') => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[typeData];
      schema.parse(data); 
      
      next(); 
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => {
          // Buscamos la traducción. Si el campo es 'email', devuelve 'Correo electrónico'
          const technicalField = err.path.join('.');
          const readableField = fieldTranslations[technicalField] || technicalField;

          return {
            field: readableField,
            message: err.message, 
          };
        });

        console.error("❌ ERROR DE VALIDACIÓN ZOD:", JSON.stringify(formattedErrors, null, 2));
        console.log("📥 Datos recibidos:", req[typeData]); 

        // Unimos todo en un string amigable para el SweetAlert
        const detailMessage = formattedErrors
          .map(e => `<b>${e.field}:</b> ${e.message}`)
          .join("<br>");

        return res.status(400).json({ 
          message: detailMessage, 
          errors: formattedErrors 
        });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
};