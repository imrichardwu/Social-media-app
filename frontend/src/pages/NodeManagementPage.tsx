import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Plus,
  Edit,
  Trash2,
  Globe,
  Users,
  Shield,
  Check,
  X,
  AlertCircle,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../components/context/AuthContext";
import { useToast } from "../components/context/ToastContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import AnimatedButton from "../components/ui/AnimatedButton";
import { api } from "../services/api";

interface Node {
  id: string;
  name: string;
  host: string;
  username: string;
  password: string;
  is_active: boolean;
  created_at: string;
}

interface NodeFormData {
  name: string;
  host: string;
  username: string;
  password: string;
  is_active: boolean;
}

export const NodeManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  const [formData, setFormData] = useState<NodeFormData>({
    name: "",
    host: "",
    username: "",
    password: "",
    is_active: true,
  });

  // Check if user is admin - default to false if fields are not available
  const isAdmin = user?.is_staff || user?.is_superuser || false;

  useEffect(() => {
    if (user) {
      fetchNodes();
    }
  }, [user]);

  const fetchNodes = async () => {
    try {
      setIsLoading(true);
      const response = await api.getNodes();
      console.log("Nodes API response:", response); // Debug log

      // Handle different response structures
      let nodesData = [];
      if (Array.isArray(response)) {
        nodesData = response;
      } else if (response && Array.isArray(response.nodes)) {
        nodesData = response.nodes;
      } else if (response && Array.isArray(response.results)) {
        nodesData = response.results;
      } else if (response && Array.isArray(response.data)) {
        nodesData = response.data;
      } else {
        console.warn("Unexpected nodes response structure:", response);
        nodesData = [];
      }

      setNodes(nodesData);
    } catch (error: any) {
      console.error("Error fetching nodes:", error);
      if (error?.message?.includes("403") || error?.message?.toLowerCase().includes("forbidden") || error?.message?.toLowerCase().includes("permission")) {
        showError("You don't have permission to view nodes. Admin access required.");
      } else if (error instanceof Error) {
        showError(`Failed to fetch nodes: ${error.message}`);
      } else {
        showError("Failed to fetch nodes");
      }
      setNodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAllNodes = async () => {
    try {
      setIsLoading(true);
      const activeNodes = nodes.filter(node => node.is_active);
      
      showSuccess(`Refreshing authors from ${activeNodes.length} active nodes...`);
      
      for (const node of activeNodes) {
        try {
          await api.refreshNode(node.host);
          console.log(`Successfully refreshed node: ${node.host}`);
        } catch (error) {
          console.error(`Failed to refresh node ${node.host}:`, error);
          showError(`Failed to refresh node: ${node.name}`);
        }
      }
      
      showSuccess("Node refresh completed! Check logs for details.");
    } catch (error) {
      console.error("Error refreshing nodes:", error);
      showError("Failed to refresh nodes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNode = async () => {
    try {
      if (
        !formData.name ||
        !formData.host ||
        !formData.username ||
        !formData.password
      ) {
        showError("All fields are required");
        return;
      }

      await api.addNode(formData);
      showSuccess("Node added successfully. Remote authors are being synced in the background.");
      setIsAddingNode(false);
      setFormData({
        name: "",
        host: "",
        username: "",
        password: "",
        is_active: true,
      });
      fetchNodes();
    } catch (error: any) {
      console.error("Error adding node:", error);
      if (error?.message?.includes("403") || error?.message?.toLowerCase().includes("forbidden") || error?.message?.toLowerCase().includes("permission")) {
        showError("You don't have permission to add nodes. Admin access required.");
      } else {
        showError("Failed to add node");
      }
    }
  };

  const handleUpdateNode = async () => {
    if (!editingNode) return;

    try {
      await api.updateNode({
        oldHost: editingNode.host,
        host: formData.host,
        username: formData.username,
        password: formData.password,
        isAuth: formData.is_active,
      });
      showSuccess("Node updated successfully");
      setEditingNode(null);
      setFormData({
        name: "",
        host: "",
        username: "",
        password: "",
        is_active: true,
      });
      fetchNodes();
    } catch (error: any) {
      console.error("Error updating node:", error);
      if (error?.message?.includes("403") || error?.message?.toLowerCase().includes("forbidden") || error?.message?.toLowerCase().includes("permission")) {
        showError("You don't have permission to update nodes. Admin access required.");
      } else {
        showError("Failed to update node");
      }
    }
  };

  const handleDeleteNode = async (node: Node) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the node "${node.name}"?`
      )
    ) {
      return;
    }

    try {
      await api.deleteNode(node.host);
      showSuccess("Node deleted successfully");
      fetchNodes();
    } catch (error: any) {
      console.error("Error deleting node:", error);
      if (error?.message?.includes("403") || error?.message?.toLowerCase().includes("forbidden") || error?.message?.toLowerCase().includes("permission")) {
        showError("You don't have permission to delete nodes. Admin access required.");
      } else {
        showError("Failed to delete node");
      }
    }
  };

  const startEdit = (node: Node) => {
    setEditingNode(node);
    setFormData({
      name: node.name,
      host: node.host,
      username: node.username,
      password: node.password,
      is_active: node.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setFormData({
      name: "",
      host: "",
      username: "",
      password: "",
      is_active: true,
    });
  };

  const togglePasswordVisibility = (nodeId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background-1 to-background-2 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-1 mb-2">
                Node Management
              </h1>
              <p className="text-text-2">
                Manage remote nodes and federation settings
              </p>
            </div>
            <AnimatedButton
              onClick={() => setIsAddingNode(true)}
              variant="primary"
              icon={<Plus size={16} />}
            >
              Add Node
            </AnimatedButton>
          </div>
        </div>

        {/* Add Node Modal */}
        <AnimatePresence>
          {isAddingNode && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop"
                onClick={() => setIsAddingNode(false)}
              />
              
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card-prominent rounded-lg shadow-xl z-modal p-6"
              >
                  <h2 className="text-xl font-semibold text-text-1 mb-4">
                    Add New Node
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-2 mb-2">
                        Node Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="My Friend's Node"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-2 mb-2">
                        Host URL
                      </label>
                      <Input
                        value={formData.host}
                        onChange={(e) =>
                          setFormData({ ...formData, host: e.target.value })
                        }
                        placeholder="https://friend-node.com"
                        icon={<Globe size={18} />}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-2 mb-2">
                        Username
                      </label>
                      <Input
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="node_username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-2 mb-2">
                        Password
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="node_password"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className="rounded border-[var(--border-1)] bg-input-bg text-[var(--primary-violet)] focus:ring-[var(--primary-violet)] focus:ring-2"
                      />
                      <label
                        htmlFor="is_active"
                        className="text-sm text-text-2"
                      >
                        Active (accept connections from this node)
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <AnimatedButton
                      onClick={handleAddNode}
                      variant="primary"
                      className="flex-1"
                    >
                      Add Node
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={() => setIsAddingNode(false)}
                      variant="secondary"
                      className="flex-1"
                    >
                      Cancel
                    </AnimatedButton>
                  </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Edit Node Modal */}
        <AnimatePresence>
          {editingNode && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop"
                onClick={cancelEdit}
              />
              
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card-prominent rounded-lg shadow-xl z-modal p-6"
              >
                  <h2 className="text-xl font-semibold text-text-1 mb-4">
                    Edit Node
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-2 mb-2">
                        Node Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="My Friend's Node"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-2 mb-2">
                        Host URL
                      </label>
                      <Input
                        value={formData.host}
                        onChange={(e) =>
                          setFormData({ ...formData, host: e.target.value })
                        }
                        placeholder="https://friend-node.com"
                        icon={<Globe size={18} />}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-2 mb-2">
                        Username
                      </label>
                      <Input
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="node_username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-2 mb-2">
                        Password
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="node_password"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit_is_active"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className="rounded border-[var(--border-1)] bg-input-bg text-[var(--primary-violet)] focus:ring-[var(--primary-violet)] focus:ring-2"
                      />
                      <label
                        htmlFor="edit_is_active"
                        className="text-sm text-text-2"
                      >
                        Active (accept connections from this node)
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <AnimatedButton
                      onClick={handleUpdateNode}
                      variant="primary"
                      className="flex-1"
                    >
                      Update Node
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={cancelEdit}
                      variant="secondary"
                      className="flex-1"
                    >
                      Cancel
                    </AnimatedButton>
                  </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Nodes List */}
        <Card variant="main" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-1">
              Connected Nodes
            </h2>
            <AnimatedButton
              onClick={async () => {
                await fetchNodes();
                await refreshAllNodes();
              }}
              variant="ghost"
              icon={<RefreshCw size={16} />}
              loading={isLoading}
            >
              Refresh Authors
            </AnimatedButton>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-text-2 mt-2">Loading nodes...</p>
            </div>
          ) : !Array.isArray(nodes) ? (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-text-1 mb-2">
                Error loading nodes
              </h3>
              <p className="text-text-2">
                There was an issue loading the nodes. Please try refreshing.
              </p>
              <AnimatedButton
                onClick={fetchNodes}
                variant="primary"
                className="mt-4"
                icon={<RefreshCw size={16} />}
              >
                Retry
              </AnimatedButton>
            </div>
          ) : nodes.length === 0 ? (
            <div className="text-center py-8">
              <Server size={48} className="mx-auto mb-4 text-text-2" />
              <h3 className="text-lg font-medium text-text-1 mb-2">
                No nodes connected
              </h3>
              <p className="text-text-2">
                Add your first remote node to start federating.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(nodes) ? nodes : []).map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border rounded-lg p-4 bg-[rgba(var(--glass-rgb),0.3)] backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Server size={20} className="text-primary" />
                        <h3 className="font-medium text-text-1">{node.name}</h3>
                        <div className="flex items-center space-x-2">
                          {node.is_active ? (
                            <span className="flex items-center space-x-1 text-green-500 text-sm">
                              <Check size={14} />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-red-500 text-sm">
                              <X size={14} />
                              <span>Inactive</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-text-2">Host:</span>
                          <p className="text-text-1 font-mono break-all">
                            {node.host}
                          </p>
                        </div>
                        <div>
                          <span className="text-text-2">Username:</span>
                          <p className="text-text-1">{node.username}</p>
                        </div>
                        <div>
                          <span className="text-text-2">Password:</span>
                          <div className="flex items-center space-x-2">
                            <p className="text-text-1 font-mono">
                              {showPasswords[node.id]
                                ? node.password
                                : "••••••••"}
                            </p>
                            <button
                              onClick={() => togglePasswordVisibility(node.id)}
                              className="text-text-2 hover:text-text-1"
                            >
                              {showPasswords[node.id] ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <AnimatedButton
                        onClick={async () => {
                          try {
                            await api.refreshNode(node.host);
                            showSuccess(`Refreshed authors from ${node.name}`);
                          } catch (error) {
                            showError(`Failed to refresh ${node.name}`);
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        icon={<RefreshCw size={14} />}
                        title="Refresh authors from this node"
                      >
                        Refresh
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={() => startEdit(node)}
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={14} />}
                      >
                        Edit
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={() => handleDeleteNode(node)}
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </AnimatedButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Federation Info */}
        <Card variant="main" className="p-6 mt-6">
          <h2 className="text-xl font-semibold text-text-1 mb-4">
            Federation Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-text-1 mb-2">Your Node</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-text-2">URL:</span>
                  <p className="text-text-1 font-mono">
                    {import.meta.env.VITE_API_URL || "http://localhost:8000"}
                  </p>
                </div>
                <div>
                  <span className="text-text-2">Status:</span>
                  <span className="text-green-500 ml-2">Online</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-text-1 mb-2">
                Connection Status
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-text-2">Connected Nodes:</span>
                  <span className="text-text-1 ml-2">
                    {
                      (Array.isArray(nodes) ? nodes : []).filter(
                        (n) => n.is_active
                      ).length
                    }
                  </span>
                </div>
                <div>
                  <span className="text-text-2">Total Nodes:</span>
                  <span className="text-text-1 ml-2">
                    {Array.isArray(nodes) ? nodes.length : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NodeManagementPage;
