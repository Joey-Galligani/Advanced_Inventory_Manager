import { useEffect, useState } from "react";
import {
  getAllProducts,
  getProductByBarCode,
  updateProduct,
  Product,
  deleteProduct,
} from "../api/productService";
import {
  Button,
  TextField,
  Spinner,
  Dialog,
} from "@radix-ui/themes";
import Navbar from '../components/Navbar';
import { 
  FaBoxOpen, 
  FaShoppingBag, 
  FaStar, 
  FaStarHalfAlt, 
  FaList, 
  FaThLarge, 
  FaEdit, 
  FaTrash, 
} from 'react-icons/fa';


const Rating = ({ rating, reviewCount }: { rating: number; reviewCount?: number }) => {
  const stars = [];
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < totalStars; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} className="text-orange-500 w-4 h-4" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<FaStarHalfAlt key={i} className="text-orange-500 w-4 h-4" />);
    } else {
      stars.push(<FaStar key={i} className="text-zinc-600 w-4 h-4" />);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        {stars}
        <span className="ml-2 text-sm text-orange-500">({rating.toFixed(1)})</span>
      </div>
      {reviewCount !== undefined && (
        <span className="text-sm text-zinc-500 mt-1">
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      )}
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barcode, setBarcode] = useState("");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isListView, setIsListView] = useState(true);
  const sortedProducts = [...products].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      setError("Failed to fetch products. Please try again later.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) {
      setError("Please enter a barcode");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const product = await getProductByBarCode(barcode);
      if (!products.find((p) => p.barCode === product.barCode)) {
        setProducts((prev) => [...prev, product]);
      }
      setBarcode("");
    } catch (err) {
      setError("Product not found or invalid barcode");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSaveError(null);
    setEditingProduct(product.barCode);
    setEditForm(product);
  };

  const handleEditChange = (field: keyof Product, value: string | number) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (barCode: string) => {
    try {
      setLoading(true);
      setSaveError(null);
      const updatedProduct = await updateProduct(barCode, editForm);
      setProducts((prev) =>
        prev.map((p) => (p.barCode === barCode ? updatedProduct : p))
      );
      setEditingProduct(null);
    } catch (err: any) {
      setSaveError(err.message || "Failed to update product");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (barCode: string) => {
    try {
      setLoading(true);
      setDeleteError(null);
      await deleteProduct(barCode);
      setProducts((prev) => prev.filter((p) => p.barCode !== barCode));
      setDeletingProduct(null);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete product");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 font-sans">
      <header className="flex justify-between items-center mb-6 p-4 rounded-lg shadow dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[-webkit-box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]">
        <div className="flex items-center gap-2">
          <FaBoxOpen className="text-xl" />
          <h1 className="text-xl font-bold">Products Stock</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-[450px]">
          <Button 
            type="button" 
            variant="solid" 
            color="orange"
            onClick={() => setIsListView(!isListView)}
          >
            {isListView ? <FaThLarge /> : <FaList />}
            {isListView ? 'Grid View' : 'List View'}
          </Button>
          <TextField.Root
            size="3"
            className="flex-1"
            placeholder="Enter barcode and press Enter..."
            onChange={(e) => {
              setBarcode(e.target.value);
              setError(null);
            }}
            value={barcode}
          />
          {error && (
            <div className="absolute -bottom-6 left-0 text-red-500 text-sm">
              {error}
            </div>
          )}
        </form>
      </header>

        {error && (
          <div className="error-message" role="alert">
            <p>Error {error}</p>
          </div>
        )}

        {loading && !editingProduct && (
          <div className="loading-spinner" role="status">
            <Spinner />
          </div>
        )}

        {isListView ? (
          <div className="overflow-x-auto bg-zinc-900 rounded-lg shadow-md">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-800 text-white">
                <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product.barCode} className="border-b border-zinc-700 hover:bg-zinc-800 transition">
                    {editingProduct === product.barCode ? (
                     <td colSpan={7} className="p-4">
                      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                        {saveError && (
                          <div className="p-3 bg-red-900/50 text-red-300 rounded-md text-sm">
                            {saveError}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-5 gap-4 items-end">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-zinc-400 whitespace-nowrap">Name:</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => handleEditChange("name", e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                              placeholder="Name"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-zinc-400 whitespace-nowrap">Price:</label>
                            <input
                              type="number"
                              value={editForm.price}
                              onChange={(e) => handleEditChange("price", Number(e.target.value))}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                              placeholder="Price"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-zinc-400 whitespace-nowrap">Stock:</label>
                            <input
                              type="number"
                              value={editForm.stock}
                              onChange={(e) => handleEditChange("stock", Number(e.target.value))}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                              placeholder="Stock"
                              min="0"
                            />
                          </div>

                          <Button variant="soft" onClick={() => setEditingProduct(null)}>
                            Cancel
                          </Button>
                          
                          <Button 
                            variant="solid" 
                            color="orange" 
                            onClick={() => handleSave(product.barCode)}
                            disabled={loading}
                          >
                            {loading ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    </td>
                    ) : (
                      <>
                        <td className="p-3">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-12 w-12 object-cover rounded-lg" />
                          ) : (
                            <FaShoppingBag className="w-8 h-8 text-zinc-600" />
                          )}
                        </td>
                        <td className="p-3">{product.name}</td>
                        <td className="p-3 text-zinc-400">{product.barCode}</td>
                        <td className="p-3 font-bold text-orange-500">{product.price.toFixed(2)}€</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            product.stock === 0 
                              ? "bg-red-900/50 text-red-300" 
                              : product.stock < 10
                              ? "bg-yellow-900/50 text-yellow-300"
                              : "bg-green-900/50 text-green-300"
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          <Rating 
                            rating={product.averageRating || 0} 
                            reviewCount={Object.keys(product.ratings).length}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button variant="soft" onClick={() => handleEdit(product)}>
                              <FaEdit />
                            </Button>
                            <Button variant="soft" color="red" onClick={() => setDeletingProduct(product.barCode)}>
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <article
              key={product.barCode}
              className="p-6 rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg hover:border-orange-500/50 transition-all flex-col flex justify-between h-full"
            >
            {editingProduct === product.barCode ? (
              // Edit Mode
              <div className="flex flex-col gap-4">
                {saveError && (
                  <div className="p-3 bg-red-900/50 text-red-300 rounded-md text-sm">
                    {saveError}
                  </div>
                )}
            
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    placeholder={product.name || "Name"}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => handleEditChange("price", Number(e.target.value))}
                      placeholder={product.price?.toString() || "Price"}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => handleEditChange("stock", Number(e.target.value))}
                      placeholder={product.stock?.toString() || "Quantity"}
                      min="0"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => handleEditChange("category", e.target.value)}
                    placeholder={product.category || "Category"}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                  
                </div>
            
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="soft"
                    onClick={() => setEditingProduct(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="solid"
                    onClick={() => handleSave(product.barCode)}
                    disabled={loading}
                    color="orange"
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Barcode : {product.barCode}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-orange-500">
                    {product.price.toFixed(2)}€
                  </span>
                </div>
            
            
                <div className="h-32 w-32 mx-auto mb-4 overflow-hidden rounded-lg bg-zinc-900">
                  {product.imageUrl && typeof product.imageUrl === 'string' && !failedImages.has(product.imageUrl) ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      onError={() => {
                        const imageUrl = product.imageUrl;
                        if (imageUrl && typeof imageUrl === 'string') {
                          setFailedImages(prev => {
                            const newSet = new Set(prev);
                            newSet.add(imageUrl);
                            return newSet;
                          });
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FaShoppingBag className="w-12 h-12 text-zinc-600" />
                    </div>
                  )}
                </div>
            
                <div className="space-y-3">
                  {/* Stock Section */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-300">Stock:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      product.stock === 0 
                        ? "bg-red-900/50 text-red-300" 
                        : product.stock < 10
                        ? "bg-yellow-900/50 text-yellow-300"
                        : "bg-green-900/50 text-green-300"
                    }`}>
                      {product.stock === 0 
                        ? `Out of Stock (${product.stock})`
                        : product.stock < 3 
                        ? `Low Stock (${product.stock})` 
                        : `In Stock (${product.stock})`}
                    </span>
                  </div>
            
                  {/* Category Section */}
                  {product.category && (
                    <span className="inline-block px-3 py-1 bg-orange-900/30 text-orange-300 rounded-lg text-sm hover:bg-orange-900/40 transition-colors">
                      {product.category}
                    </span>
                  )}
               
                  {/* Rating Section */}
                  <div className="rating-section mt-2">
                    <span className="text-sm font-medium text-zinc-300">Rating:</span>
                    <Rating 
                      rating={product.averageRating || 0} 
                      reviewCount={Object.keys(product.ratings).length} 
                    />
                    
                    <Dialog.Root>
                      <Dialog.Trigger>
                        <Button variant="surface" color="gray" size="1">
                          View Reviews ({Array.isArray(product.ratings) ? product.ratings.length : 0})
                        </Button>
                      </Dialog.Trigger>

                      <Dialog.Content className="bg-zinc-900 rounded-lg p-6 shadow-xl border border-zinc-700 max-w-md w-full mx-auto">
                        <Dialog.Title className="text-xl font-bold mb-6 text-orange-500">
                          Reviews for {product.name}
                        </Dialog.Title>
                        
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                          {!Array.isArray(product.ratings) || product.ratings.length === 0 ? (
                            <p className="text-zinc-400 text-center py-4">No reviews yet</p>
                          ) : (
                            product.ratings
                              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                              .map((rating) => (
                                <div 
                                  key={rating._id}
                                  className="p-4 rounded-lg border border-zinc-700 bg-zinc-800 hover:border-zinc-600 transition-colors"
                                >
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                          {[...Array(5)].map((_, i) => (
                                            <FaStar
                                              key={i}
                                              className={i < rating.rating ? "text-orange-500" : "text-zinc-600"}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-300">
                                          {rating.rating}/5
                                        </span>
                                      </div>
                                      <span className="text-sm text-zinc-500">
                                        {new Date(rating.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                      <span>User ID: {rating.user}</span>
                                    </div>
                                    {rating.comment && (
                                      <p className="text-zinc-300 text-sm mt-2 p-3 bg-zinc-900 rounded">
                                        "{rating.comment}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))
                          )}
                        </div>

                        <div className="flex justify-end mt-6 pt-4 border-t border-zinc-700">
                          <Dialog.Close>
                            <Button variant="soft" color="gray">
                              Close
                            </Button>
                          </Dialog.Close>
                        </div>
                      </Dialog.Content>
                    </Dialog.Root>
                  </div>
                </div>
            
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-700">
                  <Button
                    variant="soft"
                    onClick={() => handleEdit(product)}
                    className="hover:bg-orange-500/10"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="soft"
                    color="red"
                    onClick={() => setDeletingProduct(product.barCode)}
                  >
                    Delete
                  </Button>
                </div>
            
                {/* Delete Confirmation */}
                {deletingProduct === product.barCode && (
                  <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                    <p className="text-sm text-zinc-300 mb-3">
                      Are you sure you want to delete this product?
                    </p>
                    {deleteError && (
                      <div className="mb-3 p-2 bg-red-900/50 text-red-300 rounded-md text-sm">
                        {deleteError}
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="soft"
                        onClick={() => setDeletingProduct(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="solid"
                        color="red"
                        onClick={() => handleDelete(product.barCode)}
                        disabled={loading}
                      >
                        {loading ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                )}
            </>
            )}
            </article>
            ))}
          </div>
        )}

        <Dialog.Root open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
          <Dialog.Content>
            <Dialog.Title>Confirm Deletion</Dialog.Title>
            <p>Are you sure you want to delete this product?</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="soft" onClick={() => setDeletingProduct(null)}>
                Cancel
              </Button>
              <Button
                variant="soft"
                color="red"
                onClick={() => deletingProduct && handleDelete(deletingProduct)}
              >
                Delete
              </Button>
            </div>
            {deleteError && <p className="text-red-500 mt-2">{deleteError}</p>}
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </>
  );
};

export default ProductsPage;






































