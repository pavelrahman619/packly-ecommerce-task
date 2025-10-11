import express from "express";
import {
  getBanner,
  updateBanner,
  getSaleSection,
  updateSaleSection,
  getFeaturedProducts,
  updateFeaturedProducts,
  getFooter,
  updateFooter,
} from "../controllers/content.controller";

const router = express.Router();

// Banner routes
router.get("/banner", getBanner);
router.put("/banner", updateBanner);

// Sale section routes
router.get("/sale-section", getSaleSection);
router.put("/sale-section", updateSaleSection);

// Featured products routes
router.get("/featured-products", getFeaturedProducts);
router.put("/featured-products", updateFeaturedProducts);

// Footer routes
router.get("/footer", getFooter);
router.put("/footer", updateFooter);

export default router;

