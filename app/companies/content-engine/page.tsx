"use client";

import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Loader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
  View,
} from "@aws-amplify/ui-react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

import ProductEditForm from "@components/ContentEngine/ProductEditForm";
import { PageHeading } from "@components/ui/PageHeading";
import { Schema } from "amplify/data/resource";
import { useClient } from "contexts/ClientContext";
import { useUserGroups } from "contexts/UserGroupsContext";
import { withGroupAccess } from "contexts/withGroupAccess";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { ICompanyState, IProduct } from "interfaces";
import { deleteProductAction, setProductAction, updateCompanyAction } from "@redux/actions/companyAction";

type Product = Schema["Product"]["type"];

const ContentEnginePage = () => {
  const router = useRouter();
  const client = useClient();
  const dispatch = useDispatch();
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany: company } = companyState;

  const { isSuperAdmin } = useUserGroups();
  const [showProductForm, setShowProductForm] = useState(false);
  const [products, setProducts] = useState<IProduct[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!company) {
      router.push("/companies");
    }
  })
  const initialProduct = {
    productName: "",
    productValueProp: "",
    productFeature: "",
    productCtaURL: "",
  };

  const deleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await client.models.Product.delete({ id: productId });
      dispatch(deleteProductAction(productId));
    }
  };

  useEffect(() => {
    const sub = client.models.Product.observeQuery({
      selectionSet: ["id", "productName", "productCtaURL", "productFeature", "productValueProp", "status", "keywords.*"]
    }).subscribe({
      next: ({ items, isSynced }) => {
        // setProducts(items as IProduct[]);
        dispatch(updateCompanyAction({"key": "products", "value": items}));
        console.log("products: ", items);
        if (isSynced) setIsLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  if (!isSuperAdmin) {
    return <PageHeading title="No Access" />;
  }

  if (!company) {
    return <PageHeading title="Not selected company" />;
  }

  return (
    <View className="mx-auto px-4 py-8">
      <Card className="mb-8 p-6 shadow-lg rounded-lg">
        <Flex
          justifyContent="space-between"
          alignItems="center"
          className="mb-6"
        >
          <Heading level={2} className="text-2xl font-semibold text-gray-700">
            Products
          </Heading>
          <Button
            onClick={() => setShowProductForm(!showProductForm)}
            variation="primary"
            className="flex items-center"
          >
            {showProductForm ? (
              <>
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Product
              </>
            )}
          </Button>
        </Flex>

        {showProductForm && (
          <View className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <Heading
              level={3}
              className="text-xl font-semibold mb-4 text-gray-700"
            >
              Create New Product
            </Heading>
            <ProductEditForm
              product={initialProduct as Product}
              onUpdate={() => {
                setShowProductForm(false);
                // Add any additional logic here, like refreshing the product list
              }}
              type="create"
              companyId={company.id}
            />
          </View>
        )}

        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" className="h-64">
            <Loader size="large" />
          </Flex>
        ) : company.products && company.products.length > 0 ? (
          <Table highlightOnHover={true} className="w-full">
            <TableHead>
              <TableRow>
                <TableCell as="th" className="font-semibold text-gray-600">
                  Product Name
                </TableCell>
                <TableCell as="th" className="font-semibold text-gray-600">
                  ID
                </TableCell>
                <TableCell as="th" className="font-semibold text-gray-600">
                  Status
                </TableCell>
                <TableCell as="th" className="font-semibold text-gray-600">
                  Value Proposition
                </TableCell>
                <TableCell as="th" className="font-semibold text-gray-600">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {company.products.map((product: IProduct) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell>{product.productName}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.id}
                  </TableCell>
                  <TableCell>
                    <Badge
                      size="small"
                      variation={
                        product.status === "DRAFT" ? "warning" : "success"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {product.productValueProp}
                  </TableCell>
                  <TableCell>
                    <Flex gap="xs">
                      <Button
                        onClick={() => {
                          dispatch(setProductAction(product.id));
                          router.push(
                            `/companies/content-engine/product`
                          );
                        }}
                        variation="primary"
                        size="small"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => {
                          dispatch(setProductAction(product.id));
                          router.push(
                            `/companies/content-engine/product/edit`
                          )
                        }}
                        variation="primary"
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteProduct(product.id)}
                        variation="destructive"
                        size="small"
                      >
                        Delete
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Text className="text-center text-gray-500 py-8">
            No products found. Create a new product to get started.
          </Text>
        )}
      </Card>
    </View>
  );
};

export default withGroupAccess(ContentEnginePage, [
  "superAdmin",
  "companyAdmin",
]);
