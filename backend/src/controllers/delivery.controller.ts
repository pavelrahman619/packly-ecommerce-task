import { Request, Response, NextFunction } from "express";

// Validate delivery address
export const validateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { address } = req.body;

    if (!address || !address.street || !address.city || !address.state || !address.zip_code) {
      res.status(400).json({ 
        address,
        is_valid: false,
        is_in_zone: false,
        distance_miles: 0
      });
      return;
    }

    // Simplified validation logic
    // In a real app, you'd integrate with a service like Google Maps API
    const validStates = ['CA', 'NY', 'TX', 'FL', 'WA', 'OR', 'NV', 'AZ'];
    const isInZone = validStates.includes(address.state.toUpperCase());
    
    // Simulate distance calculation
    const distance_miles = isInZone ? Math.floor(Math.random() * 500) + 10 : 999;

    res.status(200).json({
      address,
      is_valid: true,
      is_in_zone: isInZone,
      distance_miles
    });
  } catch (error) {
    next(error);
  }
};

// Calculate delivery cost
export const calculateDeliveryCost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { address, order_total } = req.body;

    if (!address || !order_total) {
      res.status(400).json({ message: "Address and order total are required" });
      return;
    }

    // Simplified delivery cost calculation
    let delivery_cost = 0;
    const is_free = order_total >= 500; // Free delivery over $500

    if (!is_free) {
      // Base delivery cost
      delivery_cost = 50;

      // Additional cost based on distance (simplified)
      if (address.state && !['CA', 'NY', 'TX'].includes(address.state.toUpperCase())) {
        delivery_cost += 25; // Additional cost for distant states
      }
    }

    res.status(200).json({
      address,
      order_total,
      delivery_cost,
      is_free
    });
  } catch (error) {
    next(error);
  }
};

