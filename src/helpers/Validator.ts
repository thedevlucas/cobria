// Dependencies
import { Request, Response, NextFunction } from 'express';
import { ZodError, AnyZodObject } from 'zod';

// Validator
export const validate = (schema: AnyZodObject, typeData: 'body' | 'query' | 'params') => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[typeData];
      schema.parse(data); 
      
      next(); 
    } catch (error) {
      if (error instanceof ZodError) {

        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        console.error("❌ ERROR DE VALIDACIÓN ZOD:", JSON.stringify(formattedErrors, null, 2));
        console.log("📥 Datos recibidos:", req[typeData]); 

        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: formattedErrors 
        });
      } else {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
};