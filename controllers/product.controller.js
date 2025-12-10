const Product = require('../models/product');

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error("Get All Products Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.error("Get Product Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({
      success: true,
      message: "Product updated",
      product: updated
    });

  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({
      success: true,
      message: "Product deleted"
    });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};


export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const review = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    product.reviews.push(review);

    // Update rating + totals
    const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.totalReviews = product.reviews.length;
    product.rating = (totalRatings / product.totalReviews).toFixed(1);

    await product.save();

    res.json({
      success: true,
      message: "Review added",
      reviews: product.reviews
    });

  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(500).json({ success: false, message: "Failed to add review" });
  }
};
