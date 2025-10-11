import { Request, Response, NextFunction } from "express";
import Order from "../db/models/order.model";
import Product from "../db/models/product.model";
import User from "../db/models/user.model";

// Get admin dashboard statistics
export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get counts and statistics
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'regular' }),
      Order.find()
        .sort({ created_at: -1 })
        .limit(10)
        .populate('customer_id')
        .populate('items.product_id')
    ]);

    // Calculate revenue for the current month
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          created_at: { $gte: currentMonthStart },
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const revenue = monthlyRevenue[0]?.total || 0;

    // Get orders by status for quick overview
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top selling products this month
    const topProducts = await Order.aggregate([
      {
        $match: {
          created_at: { $gte: currentMonthStart }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product_id',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      }
    ]);

    res.status(200).json({
      total_orders: totalOrders,
      total_products: totalProducts,
      total_customers: totalCustomers,
      monthly_revenue: revenue,
      orders_by_status: ordersByStatus,
      top_products: topProducts,
      recent_orders: recentOrders.map(order => ({
        id: order._id,
        customer: order.customer_id || { first_name: 'Guest', last_name: 'Customer' },
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        items_count: order.items.length
      }))
    });
  } catch (error) {
    next(error);
  }
};

