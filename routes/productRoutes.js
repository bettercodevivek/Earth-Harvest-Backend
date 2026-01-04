const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  addReview
} = require("../controllers/product.controller");
const { authenticate } = require("../middleware/auth");

// Public routes - no authentication required
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);

// Protected routes - authentication required
router.post("/:id/reviews", authenticate, addReview);

module.exports = router;

