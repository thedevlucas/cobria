import express from "express";
import { errorHandler } from "../../config/CustomError";
import { extractUserIdFromToken } from "../../helpers/Token";
import { account_sid, auth_token_twilio } from "../../config/Constants";

const router = express.Router();

// Search available phone numbers
router.get("/search/:country", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { country } = req.params;
    
    // Validate country code
    const validCountries = ["AR", "BR", "CL", "CO", "EC", "VE", "US"];
    if (!validCountries.includes(country)) {
      return res.status(400).json({ error: "Invalid country code" });
    }

    // Validate Twilio credentials
    if (!account_sid || !auth_token_twilio) {
      return res.status(503).json({ 
        error: "Twilio credentials not configured",
        message: "Contact administrator to configure Twilio credentials" 
      });
    }

    // Call Twilio API from backend (secure)
    const axios = require("axios");
    
    let twilioResponse;
    try {
      twilioResponse = await axios.get(
        `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/AvailablePhoneNumbers/${country}/Local.json`,
        {
          auth: {
            username: account_sid,
            password: auth_token_twilio,
          },
        }
      );
    } catch (twilioError: any) {
      console.error("Twilio API Error:", twilioError.response?.data || twilioError.message);
      
      // Handle Twilio-specific errors
      if (twilioError.response?.status === 401) {
        return res.status(503).json({
          error: "Invalid Twilio credentials",
          message: "Your Twilio credentials are invalid or expired. Please update them in the backend configuration.",
          twilioError: twilioError.response?.data,
        });
      }
      
      if (twilioError.response?.status === 403) {
        return res.status(503).json({
          error: "Twilio permission denied",
          message: "Your Twilio account doesn't have permission to access phone numbers. Please upgrade your Twilio plan.",
        });
      }
      
      throw twilioError;
    }

    // Calculate prices
    const priceMap: Record<string, number> = {
      AR: 8,
      BR: 4.25,
      CL: 7,
      CO: 14,
      EC: 34,
      VE: 60,
      US: 1.15,
    };

    const basePrice = priceMap[country] || 0;
    const finalPrice = Math.ceil(basePrice + basePrice * 0.6) + 10;

    const phoneNumbers = (twilioResponse.data.available_phone_numbers || []).map((phone: any) => ({
      friendly_name: phone.friendly_name,
      phone_number: phone.phone_number,
      price: finalPrice,
    }));

    res.json({
      success: true,
      phone_numbers: phoneNumbers,
      count: phoneNumbers.length,
    });
  } catch (error: any) {
    console.error("Error searching phone numbers:", error.message);
    errorHandler(error, res);
  }
});

// Purchase phone number
router.post("/purchase", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // TODO: Implement phone number purchase logic
    // This should:
    // 1. Purchase from Twilio
    // 2. Create cost entry
    // 3. Associate with user/agent
    
    res.json({
      success: true,
      message: "Phone number purchase initiated",
      phoneNumber,
    });
  } catch (error: any) {
    console.error("Error purchasing phone number:", error.message);
    errorHandler(error, res);
  }
});

export = router;

