// components/ProductEditForm.tsx
import React, { useState } from "react";

import { Button } from "@aws-amplify/ui-react";
import { Schema } from "amplify/data/resource";
import { useClient } from "contexts/ClientContext";

type Product = Schema["Product"]["type"];

interface ProductEditFormProps {
  product: Product;
  onUpdate: (updatedProduct: Product) => void;
  type: "edit" | "create";
  companyId: string;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({
  product,
  onUpdate,
  type,
  companyId,
}) => {
  const client = useClient();
  const [productName, setProductName] = useState(product.productName);
  const [productValueProp, setProductValueProp] = useState(
    product.productValueProp || ""
  );
  const [productFeature, setProductFeature] = useState(
    product.productFeature || ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedProduct: Product = {
      ...product,
      productName,
      productValueProp: productValueProp || undefined,
      companyId: companyId,
      status: "Setting up",
    };

    try {
      const isEditMode = type === "edit";
      const { data, errors } = isEditMode
        ? await client.models.Product.update(updatedProduct)
        : await client.models.Product.create(updatedProduct);
      console.log("data", data);
      console.log("errors", errors);
      if (errors) {
        console.error(
          `Error ${isEditMode ? "updating" : "creating"} product:`,
          errors
        );
      } else {
        console.log(
          `Product ${isEditMode ? "updated" : "created"} successfully:`,
          data
        );
        // Optionally, you can perform additional actions after successful update/creation
      }
    } catch (error) {
      console.error("Error updating/creating product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="productName" className="block font-bold mb-2">
          Product Name
        </label>
        <input
          type="text"
          id="productName"
          value={productName || ""}
          onChange={(e) => setProductName(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block font-bold mb-2">
          Value Prop
        </label>
        <textarea
          id="description"
          value={productValueProp || ""}
          onChange={(e) => setProductValueProp(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="feature" className="block font-bold mb-2">
          Feature
        </label>
        <textarea
          id="feature"
          value={productFeature || ""}
          onChange={(e) => setProductFeature(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
      </div>
      {/* <div className="mb-4">
        <label htmlFor="keywords" className="block font-bold mb-2">
          Keywords
        </label>
        <input
          type="text"
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
        <p className="text-sm text-gray-500">
          Enter keywords separated by commas (e.g., keyword1, keyword2,
          keyword3)
        </p>
      </div> */}

      <Button type="submit" isLoading={loading}>
        {type === "edit" ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
};

export default ProductEditForm;
