// Invoices.tsx
import { useEffect, useState } from "react";
import { Box, Button, Dialog, Select, Flex } from "@radix-ui/themes";
import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../api/invoiceService";
import { FaEdit, FaTrash, FaEye, FaFileInvoiceDollar } from "react-icons/fa";
import "./Invoices.css";
import Navbar from "../components/Navbar";
import { getAllInvoices } from "../api/adminService";

interface InvoiceItem {
  productId: string;
  bareCode: string;
  quantity: number;
  price: number;
}

interface Invoice {
  _id: string;
  userId: string;
  items: InvoiceItem[];
  totalAmount: number;
  status:
    | "FAILED"
    | "REFUNDED"
    | "PENDING"
    | "PARTIALLY_REFUNDED"
    | "DECLINED"
    | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

type InvoiceFormData = Omit<Invoice, "_id" | "createdAt" | "updatedAt">;

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState<InvoiceFormData>({
    userId: "",
    items: [],
    totalAmount: 0,
    status: 'PENDING'
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllInvoices();
      const data = Array.isArray(response) ? response : response?.data;

      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (editingInvoice) {
        await updateInvoice(editingInvoice, formData);
      } else {
        await createInvoice(formData);
      }

      await fetchInvoices();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Error saving invoice:", err);
      setError(
        err.message ||
          (editingInvoice
            ? "Failed to update invoice"
            : "Failed to create invoice")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    try {
      setLoading(true);
      setError(null);
      await deleteInvoice(invoiceId);
      await fetchInvoices();
    } catch (err: any) {
      console.error("Error deleting invoice:", err);
      setError(err.message || "Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      items: [],
      totalAmount: 0,
      status: 'PENDING'
    });
    setEditingInvoice(null);
  };

  const filteredInvoices = (
    statusFilter === "all"
      ? invoices
      : invoices.filter((invoice) => invoice.status === statusFilter)
  ).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      <Navbar />
      <Box className="invoices-container">
        <header className="invoices-header">
          <div className="flex items-center gap-2">
            <FaFileInvoiceDollar className="text-2xl" />
            <h1 className="text-2xl font-bold text-white">Invoices</h1>
          </div>
          <Flex gap="4" align="center">
            <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="all">ALL STATUS</Select.Item>
                <Select.Item value="pending">PENDING</Select.Item>
                <Select.Item value="failed">FAILED</Select.Item>
                <Select.Item value="refunded">REFUNDED</Select.Item>
                <Select.Item value="partially_refunded">PARTIALLY REFUNDED</Select.Item>
                <Select.Item value="declined">DECLINED</Select.Item>
                <Select.Item value="completed">COMPLETED</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading invoices...</div>
        ) : (
          <div className="invoices-table-container">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>User</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>#{invoice._id.slice(-6)}</td>
                    <td>{invoice.userId}</td>
                    <td>{invoice.totalAmount.toFixed(2)}€</td>
                    <td>
                      <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                        {invoice.status.toLowerCase()}
                      </span>
                    </td>
                    <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Flex gap="2">
                        <Button
                          variant="soft"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowDetailsModal(true);
                          }}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="soft"
                          onClick={() => {
                            setEditingInvoice(invoice._id);
                            setFormData({
                              userId: invoice.userId,
                              items: invoice.items,
                              totalAmount: invoice.totalAmount,
                              status: invoice.status,
                            });
                            setIsModalOpen(true);
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="soft"
                          color="red"
                          onClick={() => handleDelete(invoice._id)}
                        >
                          <FaTrash />
                        </Button>
                      </Flex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Content className="bg-zinc-900 rounded-lg p-6 shadow-xl border border-zinc-700 max-w-md w-full mx-auto">
            <Dialog.Title className="text-xl font-bold mb-6 text-orange-500">
              {editingInvoice ? "Edit Invoice" : "Create Invoice"}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  User ID
                </label>
                <input
                  type="text"
                  placeholder="Enter user ID"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Total Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalAmount: Number(e.target.value),
                    })
                  }
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Invoice["status"],
                    })
                  }
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="PENDING" className="pending">Pending</option>
                  <option value="COMPLETED" className="completed">Paid</option>
                  <option value="FAILED"  className="failed">Failed</option>
                  <option value="DECLINED"  className="declined">Declined</option>
                  <option value="REFUNDED"  className="refunded">Refunded</option>
                  <option value="PARTIALLY_REFUNDED"  className="partially_refunded">Partially Refunded</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
                <Button
                  type="button"
                  variant="soft"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                  className="hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="solid"
                  color="orange"
                >
                  {loading ? "Saving..." : editingInvoice ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Root>

        {/* Details Modal */}
        <Dialog.Root open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <Dialog.Content className="invoice-details-modal">
            <Dialog.Title className="text-xl font-bold mb-4 text-white">
              Invoice Details
            </Dialog.Title>

            {selectedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-400">Invoice Bare Code</p>
                    <p className="text-white">#{selectedInvoice._id}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">User ID</p>
                    <p className="text-white">{selectedInvoice.userId}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Status</p>
                    <span className={`status-badge ${selectedInvoice.status}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-zinc-400">Total Amount</p>
                    <p className="text-white">
                      {selectedInvoice.totalAmount.toFixed(2)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Created At</p>
                    <p className="text-white">
                      {new Date(selectedInvoice.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Updated At</p>
                    <p className="text-white">
                      {new Date(selectedInvoice.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-zinc-400 py-2">
                            Product ID
                          </th>
                          <th className="text-left text-zinc-400 py-2">
                            Quantity
                          </th>
                          <th className="text-left text-zinc-400 py-2">
                            Price
                          </th>
                          <th className="text-left text-zinc-400 py-2">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index} className="border-t border-zinc-800">
                            <td className="text-white py-2">
                              {item.productId}
                            </td>
                            <td className="text-white py-2">{item.quantity}</td>
                            <td className="text-white py-2">
                              {item.price.toFixed(2)}€
                            </td>
                            <td className="text-white py-2">
                              {(item.quantity * item.price).toFixed(2)}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button variant="soft" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </Box>
    </>
  );
};

export default InvoicesPage;
