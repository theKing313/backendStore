import { productService } from "../service/productService.js";

class ProductController {
  async getAll(req, res) {
    try {
      const products = await productService.getAllProducts();
      return res.json(products);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newProduct = await productService.createProduct(req.body);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedProduct = await productService.updateProduct(
        req.params.id,
        req.body,
      );
      return res.json(updatedProduct);
    } catch (error) {
      console.error(error);
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(500).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deletedCount = await productService.deleteProduct(req.params.id);
      if (!deletedCount) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(500).json({ message: error.message });
    }
  }
}

export const productController = new ProductController();
