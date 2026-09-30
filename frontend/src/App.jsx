import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./index.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://military-asset-management-58ew.onrender.com";

function decodeJwt(token) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return {};
    }

    let payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    while (payload.length % 4 !== 0) {
      payload += "=";
    }

    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString();
}

function App() {
  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ============================================================
  // NAVIGATION
  // ============================================================

  const [activePage, setActivePage] = useState("overview");

const [dashboard, setDashboard] = useState(null);

const [assets, setAssets] = useState([]);

const [purchases, setPurchases] = useState([]);

const [transfers, setTransfers] = useState([]);

const [assignments, setAssignments] = useState([]);

const [expenditures, setExpenditures] = useState([]);

const [bases, setBases] = useState([]);

const [assetTypes, setAssetTypes] = useState([]);

const [auditLogs, setAuditLogs] = useState([]);

  // ============================================================
  // DASHBOARD FILTERS
  // ============================================================

  const today = new Date().toISOString().split("T")[0];
  const [purchaseFormOpen, setPurchaseFormOpen] = useState(false);
const [purchaseSaving, setPurchaseSaving] = useState(false);
const [purchaseMessage, setPurchaseMessage] = useState("");
const [purchaseFormError, setPurchaseFormError] = useState("");

const [purchaseForm, setPurchaseForm] = useState({
  purchaseDate: today,
  assetTypeId: "",
  baseId: "",
  quantity: "",
});

const [transferFormOpen, setTransferFormOpen] =
  useState(false);

  const [users, setUsers] = useState([]);

const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);
const [expenditureFormOpen, setExpenditureFormOpen] =
  useState(false);

const [expenditureSaving, setExpenditureSaving] =
  useState(false);

const [expenditureMessage, setExpenditureMessage] =
  useState("");

const [expenditureFormError, setExpenditureFormError] =
  useState("");

const [expenditureForm, setExpenditureForm] =
  useState({
    assetId: "",
    reason: "",
  });
const [assignmentSaving, setAssignmentSaving] = useState(false);

const [assignmentReturning, setAssignmentReturning] =
  useState(null);
const [assignmentMessage, setAssignmentMessage] = useState("");
const [assignmentFormError, setAssignmentFormError] = useState("");

const [assignmentForm, setAssignmentForm] = useState({
  assetId: "",
  assignedToUserId: "",
});

const [transferSaving, setTransferSaving] =
  useState(false);

const [transferMessage, setTransferMessage] =
  useState("");

const [transferFormError, setTransferFormError] =
  useState("");

const [transferForm, setTransferForm] = useState({
  assetId: "",
  fromBaseId: "",
  toBaseId: "",
  transferDate: new Date()
    .toISOString()
    .slice(0, 16),
});

  const firstDayOfMonth = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  }, []);

  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);
  const [baseId, setBaseId] = useState(1);

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  // ============================================================
  // TABLE SEARCH
  // ============================================================

  const [assetSearch, setAssetSearch] = useState("");
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [transferSearch, setTransferSearch] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [expenditureSearch, setExpenditureSearch] = useState("");
  const [baseSearch, setBaseSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  const role = user?.role || "";

  // ============================================================
  // RESTORE LOGIN
  // ============================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    const claims = decodeJwt(token);
    const storedUser = localStorage.getItem("user");

    let restoredUser = null;

    if (storedUser) {
      try {
        restoredUser = JSON.parse(storedUser);
      } catch {
        restoredUser = null;
      }
    }

    const restored =
      restoredUser || {
        username: claims.sub || "",
        role: claims.role || "",
      };

    setUser(restored);

    if (
      claims.baseId !== undefined &&
      claims.baseId !== null
    ) {
      setBaseId(Number(claims.baseId));
    }

    if (
      restored.role === "LOGISTICS_OFFICER"
    ) {
      setActivePage("purchases");
    } else {
      setActivePage("overview");
    }
  }, [token]);

  // ============================================================
  // LOAD ALL ALLOWED DATA
  // ============================================================

  const loadData = async () => {
    if (!token || !role) {
      return;
    }

    setPageError("");

    const authConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // ----------------------------------------------------------
    // ADMIN / BASE COMMANDER
    // ----------------------------------------------------------

    if (
      role === "ADMIN" ||
      role === "BASE_COMMANDER"
    ) {
      setDashboardLoading(true);

      try {
        const dashboardResponse = await axios.get(
          `${API_BASE_URL}/api/dashboard`,
          {
            params: {
              baseId,
              fromDate,
              toDate,
            },
            ...authConfig,
          }
        );

        setDashboard(dashboardResponse.data);
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          return;
        }

        if (error.response?.status === 403) {
          setPageError(
            "You are not authorized to view this base dashboard."
          );
        } else {
          setPageError(
            "Unable to load dashboard data."
          );
        }
      } finally {
        setDashboardLoading(false);
      }

      // Assets
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/assets`,
          authConfig
        );

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        if (role === "BASE_COMMANDER") {
          setAssets(
            data.filter(
              (asset) =>
                Number(asset?.base?.id) ===
                Number(baseId)
            )
          );
        } else {
          setAssets(data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          return;
        }

        setAssets([]);
      }

      // Assignments
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/assignments`,
          authConfig
        );

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        if (role === "BASE_COMMANDER") {
          setAssignments(
            data.filter(
              (assignment) =>
                Number(
                  assignment?.assignedToUser?.base?.id
                ) === Number(baseId)
            )
          );
        } else {
          setAssignments(data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          return;
        }

        setAssignments([]);
      }

      // Expenditures
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/expenditures`,
          authConfig
        );

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        if (role === "BASE_COMMANDER") {
          setExpenditures(
            data.filter(
              (expenditure) =>
                Number(
                  expenditure?.asset?.base?.id
                ) === Number(baseId)
            )
          );
        } else {
          setExpenditures(data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          return;
        }

        setExpenditures([]);
      }

      // Bases
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/bases`,
          authConfig
        );

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        if (role === "BASE_COMMANDER") {
          setBases(
            data.filter(
              (base) =>
                Number(base?.id) === Number(baseId)
            )
          );
        } else {
          setBases(data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          return;
        }

        setBases([]);
      }
    }

    // ----------------------------------------------------------
    // ADMIN / LOGISTICS OFFICER
    // ----------------------------------------------------------

    if (
      role === "ADMIN" ||
      role === "LOGISTICS_OFFICER"
    ) {
      // Asset Types
try {
  const response = await axios.get(
    `${API_BASE_URL}/api/asset-types`,
    authConfig
  );

  setAssetTypes(
    Array.isArray(response.data)
      ? response.data
      : []
  );
} catch (error) {
  if (error.response?.status === 401) {
    logout();
    return;
  }

  setAssetTypes([]);
}

// Bases
try {
  const response = await axios.get(
    `${API_BASE_URL}/api/bases`,
    authConfig
  );

  setBases(
    Array.isArray(response.data)
      ? response.data
      : []
  );
} catch (error) {
  if (error.response?.status === 401) {
    logout();
    return;
  }

  setBases([]);
}


      // Purchases
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/purchases`,
          authConfig
        );

        setPurchases(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          return;
        }

        setPurchases([]);
      }

      // Transfers
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/transfers`,
          authConfig
        );

        setTransfers(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          return;
        }

        setTransfers([]);
      }
    }

    // ----------------------------------------------------------
    // ADMIN
    // ----------------------------------------------------------

    if (role === "ADMIN") {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/audit-logs`,
          authConfig
        );

        setAuditLogs(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          return;
        }

        setAuditLogs([]);
      }
    }
  };

  useEffect(() => {
    if (token && user) {
      loadData();
    }
  }, [token, user, baseId]);

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          username,
          password,
        }
      );

      const data = response.data;

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      localStorage.setItem(
        "role",
        data.role || ""
      );

      const claims = decodeJwt(data.token);

      if (
        claims.baseId !== undefined &&
        claims.baseId !== null
      ) {
        setBaseId(Number(claims.baseId));
      }

      setToken(data.token);
      setUser(data);

      setActivePage(
        data.role === "LOGISTICS_OFFICER"
          ? "purchases"
          : "overview"
      );
    } catch (error) {
      if (error.response?.status === 401) {
        setLoginError(
          "Invalid operator ID or access code."
        );
      } else {
        setLoginError(
          "Unable to connect to the backend."
        );
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setToken("");
    setUser(null);

    setDashboard(null);
    setAssets([]);
    setPurchases([]);
    setTransfers([]);
    setAssignments([]);
    setExpenditures([]);
    setBases([]);
    setAuditLogs([]);

    setUsername("");
    setPassword("");
    setLoginError("");

    setActivePage("overview");
  }

  // ============================================================
  // SEARCHED DATA
  // ============================================================

  const filteredAssets = assets.filter((asset) => {
    const search = assetSearch.toLowerCase();

    return (
      !search ||
      String(asset?.assetCode || "")
        .toLowerCase()
        .includes(search) ||
      String(asset?.assetType?.name || "")
        .toLowerCase()
        .includes(search) ||
      String(asset?.base?.name || "")
        .toLowerCase()
        .includes(search) ||
      String(asset?.status || "")
        .toLowerCase()
        .includes(search)
    );
  });

  const filteredPurchases = purchases.filter(
    (purchase) => {
      const search =
        purchaseSearch.toLowerCase();

      return (
        !search ||
        String(purchase?.purchaseDate || "")
          .toLowerCase()
          .includes(search) ||
        String(purchase?.assetType?.name || "")
          .toLowerCase()
          .includes(search) ||
        String(purchase?.base?.name || "")
          .toLowerCase()
          .includes(search) ||
        String(purchase?.quantity ?? "")
          .toLowerCase()
          .includes(search)
      );
    }
  );

  const filteredTransfers = transfers.filter(
    (transfer) => {
      const search =
        transferSearch.toLowerCase();

      return (
        !search ||
        String(transfer?.id ?? "")
          .toLowerCase()
          .includes(search) ||
        String(
          transfer?.asset?.assetCode || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          transfer?.fromBase?.name || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          transfer?.toBase?.name || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(transfer?.status || "")
          .toLowerCase()
          .includes(search)
      );
    }
  );
const closePurchaseForm = () => {
  setPurchaseFormOpen(false);
  setPurchaseFormError("");
  setPurchaseMessage("");
};

const closeTransferForm = () => {
  setTransferFormOpen(false);
  setTransferFormError("");
  setTransferMessage("");
};

const openAssignmentForm = async () => {
  try {
    setAssignmentFormError("");
    setAssignmentMessage("");

    const [assetsResponse, usersResponse] =
      await Promise.all([
        axios.get(
          `${API_BASE_URL}/api/assets`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        axios.get(
          `${API_BASE_URL}/api/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

    const userData = Array.isArray(
      usersResponse.data
    )
      ? usersResponse.data
      : [];

    const assignmentAssets = Array.isArray(
      assetsResponse.data
    )
      ? assetsResponse.data
      : [];

    setAssets(
      role === "BASE_COMMANDER"
        ? assignmentAssets.filter(
            (asset) =>
              Number(asset?.base?.id) ===
              Number(baseId)
          )
        : assignmentAssets
    );

    setUsers(userData);

    setAssignmentForm({
      assetId: "",
      assignedToUserId: "",
    });

    setAssignmentFormOpen(true);
  } catch (error) {
    console.error(
      "Unable to load assignment data:",
      error
    );

    if (error.response?.status === 401) {
      logout();
      return;
    }

    setAssignmentFormError(
      error.response?.data?.message ||
        "Unable to load assignment data."
    );

    setAssignmentFormOpen(true);
  }
};

const closeAssignmentForm = () => {
  setAssignmentFormOpen(false);
  setAssignmentFormError("");
  setAssignmentMessage("");

  setAssignmentForm({
    assetId: "",
    assignedToUserId: "",
  });
};

const handleTransferSubmit = async (event) => {
  event.preventDefault();

  setTransferFormError("");
  setTransferMessage("");

  if (!transferForm.assetId) {
    setTransferFormError(
      "Please select an asset."
    );
    return;
  }

  if (!transferForm.fromBaseId) {
    setTransferFormError(
      "Please select source base."
    );
    return;
  }

  if (!transferForm.toBaseId) {
    setTransferFormError(
      "Please select destination base."
    );
    return;
  }

  if (
    Number(transferForm.fromBaseId) ===
    Number(transferForm.toBaseId)
  ) {
    setTransferFormError(
      "Source base and destination base cannot be the same."
    );
    return;
  }

  try {
    setTransferSaving(true);

    const payload = {
      assetId: Number(
        transferForm.assetId
      ),
      fromBaseId: Number(
        transferForm.fromBaseId
      ),
      toBaseId: Number(
        transferForm.toBaseId
      ),
      transferDate:
        transferForm.transferDate
          ? new Date(
              transferForm.transferDate
            )
              .toISOString()
              .slice(0, 19)
          : null,
    };

    await axios.post(
      `${API_BASE_URL}/api/transfers`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setTransferMessage(
      "Transfer created successfully."
    );

    await loadData();

    setTimeout(() => {
      closeTransferForm();
    }, 800);
  } catch (error) {
    console.error(
      "Transfer creation failed:",
      error
    );

    if (
      error.response?.status === 401
    ) {
      logout();
      return;
    }

    setTransferFormError(
      error.response?.data?.message ||
        "Unable to create transfer."
    );
  } finally {
    setTransferSaving(false);
  }
};

const handleAssignmentSubmit = async (
  event
) => {
  event.preventDefault();

  setAssignmentFormError("");
  setAssignmentMessage("");

  if (!assignmentForm.assetId) {
    setAssignmentFormError(
      "Please select an asset."
    );
    return;
  }

  if (
    !assignmentForm.assignedToUserId
  ) {
    setAssignmentFormError(
      "Please select a user."
    );
    return;
  }

  try {
    setAssignmentSaving(true);

    const payload = {
      assetId: Number(
        assignmentForm.assetId
      ),
      assignedToUserId: Number(
        assignmentForm.assignedToUserId
      ),
    };

    await axios.post(
      `${API_BASE_URL}/api/assignments`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setAssignmentMessage(
      "Asset assigned successfully."
    );

    await loadData();

    setTimeout(() => {
      closeAssignmentForm();
    }, 800);
  } catch (error) {
    console.error(
      "Assignment creation failed:",
      error
    );

    if (
      error.response?.status === 401
    ) {
      logout();
      return;
    }

    setAssignmentFormError(
      error.response?.data?.message ||
        error.response?.data ||
        "Unable to assign asset."
    );
  } finally {
    setAssignmentSaving(false);
  }
};


const handleAssignmentReturn = async (
  assignmentId
) => {
  const confirmed = window.confirm(
    "Are you sure you want to return this asset?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setAssignmentReturning(assignmentId);
    setAssignmentFormError("");
    setAssignmentMessage("");

    await axios.put(
      `${API_BASE_URL}/api/assignments/${assignmentId}/return`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setAssignmentMessage(
      "Asset returned successfully."
    );

    await loadData();
  } catch (error) {
    console.error(
      "Asset return failed:",
      error
    );

    if (error.response?.status === 401) {
      logout();
      return;
    }

    setAssignmentFormError(
      error.response?.data?.message ||
        error.response?.data ||
        "Unable to return asset."
    );
  } finally {
    setAssignmentReturning(null);
  }
};

const openExpenditureForm = async () => {
  try {
    setExpenditureFormError("");
    setExpenditureMessage("");

    setExpenditureForm({
      assetId: "",
      reason: "",
    });

    const response = await axios.get(
      `${API_BASE_URL}/api/assets`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const assetData = Array.isArray(
      response.data
    )
      ? response.data
      : [];

    setAssets(
      role === "BASE_COMMANDER"
        ? assetData.filter(
            (asset) =>
              Number(asset?.base?.id) ===
              Number(baseId)
          )
        : assetData
    );

    setExpenditureFormOpen(true);
  } catch (error) {
    console.error(
      "Unable to load expenditure assets:",
      error
    );

    if (error.response?.status === 401) {
      logout();
      return;
    }

    setExpenditureFormError(
      error.response?.data?.message ||
        "Unable to load assets."
    );

    setExpenditureFormOpen(true);
  }
};

const closeExpenditureForm = () => {
  setExpenditureFormOpen(false);
  setExpenditureFormError("");
  setExpenditureMessage("");

  setExpenditureForm({
    assetId: "",
    reason: "",
  });
};

const handleExpenditureSubmit = async (
  event
) => {
  event.preventDefault();

  setExpenditureFormError("");
  setExpenditureMessage("");

  if (!expenditureForm.assetId) {
    setExpenditureFormError(
      "Please select an assigned asset."
    );
    return;
  }

  if (!expenditureForm.reason.trim()) {
    setExpenditureFormError(
      "Please enter the expenditure reason."
    );
    return;
  }

  try {
    setExpenditureSaving(true);

    const payload = {
      assetId: Number(
        expenditureForm.assetId
      ),
      reason: expenditureForm.reason.trim(),
    };

    await axios.post(
      `${API_BASE_URL}/api/expenditures`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setExpenditureMessage(
      "Expenditure recorded successfully."
    );

    await loadData();

    setTimeout(() => {
      closeExpenditureForm();
    }, 800);
  } catch (error) {
    console.error(
      "Expenditure creation failed:",
      error
    );

    if (error.response?.status === 401) {
      logout();
      return;
    }

    setExpenditureFormError(
      error.response?.data?.message ||
        error.response?.data ||
        "Unable to create expenditure."
    );
  } finally {
    setExpenditureSaving(false);
  }
};

    const handlePurchaseSubmit = async (event) => {
    event.preventDefault();

    setPurchaseSaving(true);
    setPurchaseMessage("");
    setPurchaseFormError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/purchases`,
        {
          purchaseDate: purchaseForm.purchaseDate,
          assetTypeId: Number(purchaseForm.assetTypeId),
          baseId: Number(purchaseForm.baseId),
          quantity: Number(purchaseForm.quantity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setPurchaseMessage("Purchase record added successfully.");

        setPurchaseForm({
          purchaseDate: new Date().toISOString().split("T")[0],
          assetTypeId: "",
          baseId: "",
          quantity: "",
        });

        await loadData();

        setTimeout(() => {
          setPurchaseFormOpen(false);
          setPurchaseMessage("");
        }, 800);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        return;
      }

      if (error.response?.status === 403) {
        setPurchaseFormError(
          "You are not authorized to create a purchase."
        );
        return;
      }

      if (error.response?.data?.message) {
        setPurchaseFormError(error.response.data.message);
      } else {
        setPurchaseFormError(
          "Failed to save purchase record."
        );
      }
    } finally {
      setPurchaseSaving(false);
    }
  };

  const filteredAssignments =
    assignments.filter((assignment) => {
      const search =
        assignmentSearch.toLowerCase();

      return (
        !search ||
        String(
          assignment?.asset?.assetCode || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          assignment?.assignedToUser?.fullName ||
            ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          assignment?.assignedToUser?.username ||
            ""
        )
          .toLowerCase()
          .includes(search)
      );
    });

  const filteredExpenditures =
    expenditures.filter((expenditure) => {
      const search =
        expenditureSearch.toLowerCase();

      return (
        !search ||
        String(
          expenditure?.asset?.assetCode || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          expenditure?.reason || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          expenditure?.expenditureDate || ""
        )
          .toLowerCase()
          .includes(search)
      );
    });

  const filteredBases = bases.filter((base) => {
    const search =
      baseSearch.toLowerCase();

    return (
      !search ||
      String(base?.name || "")
        .toLowerCase()
        .includes(search) ||
      String(base?.location || "")
        .toLowerCase()
        .includes(search)
    );
  });

  const filteredAuditLogs =
    auditLogs.filter((log) => {
      const search =
        auditSearch.toLowerCase();

      return (
        !search ||
        String(log?.username || "")
          .toLowerCase()
          .includes(search) ||
        String(log?.action || "")
          .toLowerCase()
          .includes(search) ||
        String(log?.entityType || "")
          .toLowerCase()
          .includes(search) ||
        String(log?.entityId ?? "")
          .toLowerCase()
          .includes(search)
      );
    });

  // ============================================================
  // LOGIN UI
  // ============================================================

  if (!token || !user) {
    return (
      <div className="login-shell">
        <div className="login-grid">
          <section className="login-visual">
            <div className="visual-top">
              <div className="brand-mark large">
                MA
              </div>

              <span>
                MILITARY ASSET MANAGEMENT
              </span>
            </div>

            <div className="visual-center">
              <div className="visual-kicker">
                SECURE OPERATIONS PLATFORM
              </div>

              <h1>
                CONTROL.
                <br />
                TRACK.
                <br />
                ACCOUNT.
              </h1>

              <p>
                Centralized management of military
                assets, movement, assignments and
                expenditure records.
              </p>
            </div>

            <div className="visual-footer">
              <span>
                LOCAL COMMAND NETWORK
              </span>

              <span>
                ENCRYPTED SESSION
              </span>

              <span>
                V1.0
              </span>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-panel-inner">
              <div className="panel-line"></div>

              <div className="login-kicker">
                AUTHENTICATION REQUIRED
              </div>

              <h2>
                Operator Login
              </h2>

              <p className="login-description">
                Enter authorized credentials to access
                the command system.
              </p>

              <form onSubmit={handleLogin}>
                <div className="field">
                  <label htmlFor="username">
                    OPERATOR ID
                  </label>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    placeholder="Enter operator ID"
                    onChange={(event) =>
                      setUsername(
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="password">
                    ACCESS CODE
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="Enter access code"
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                {loginError && (
                  <div className="login-error">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="login-button"
                  disabled={loginLoading}
                >
                  {loginLoading
                    ? "AUTHENTICATING..."
                    : "ENTER SYSTEM"}
                </button>
              </form>

              <div className="authorization-note">
                <span className="status-dot"></span>
                AUTHORIZED PERSONNEL ONLY
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ============================================================
  // AUTHENTICATED UI
  // ============================================================

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            MA
          </div>

          <div>
            <div className="brand-title">
              MIL-ASSET
            </div>

            <div className="brand-subtitle">
              COMMAND SYSTEM
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          OPERATIONS
        </div>

        {(role === "ADMIN" ||
          role === "BASE_COMMANDER") && (
          <>
            <button
              className={`nav-item ${
                activePage === "overview"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("overview")
              }
            >
              Overview
            </button>

            <button
              className={`nav-item ${
                activePage === "assets"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("assets")
              }
            >
              Assets
            </button>
          </>
        )}

        {(role === "ADMIN" ||
          role === "LOGISTICS_OFFICER") && (
          <>
            <button
              className={`nav-item ${
                activePage === "purchases"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("purchases")
              }
            >
              Purchases
            </button>

            <button
              className={`nav-item ${
                activePage === "transfers"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("transfers")
              }
            >
              Transfers
            </button>
          </>
        )}

        {(role === "ADMIN" ||
          role === "BASE_COMMANDER") && (
          <>
            <button
              className={`nav-item ${
                activePage === "assignments"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("assignments")
              }
            >
              Assignments
            </button>

            <button
              className={`nav-item ${
                activePage === "expenditures"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("expenditures")
              }
            >
              Expenditures
            </button>
          </>
        )}

        <div className="sidebar-section">
          MANAGEMENT
        </div>

        {(role === "ADMIN" ||
          role === "BASE_COMMANDER") && (
          <button
            className={`nav-item ${
              activePage === "bases"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("bases")
            }
          >
            Bases
          </button>
        )}

        {role === "ADMIN" && (
          <button
            className={`nav-item ${
              activePage === "audit"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("audit")
            }
          >
            Audit Logs
          </button>
        )}

        <div className="sidebar-footer">
          <div className="operator-label">
            SIGNED IN AS
          </div>

          <div className="operator-name">
            {user.username || username}
          </div>

          <div className="operator-role">
            {role}
          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="page-kicker">
              OPERATIONS CONTROL
            </div>

            <h1>
              {activePage === "overview"
                ? "System Overview"
                : activePage === "assets"
                ? "Asset Register"
                : activePage === "purchases"
                ? "Purchase Register"
                : activePage === "transfers"
                ? "Transfer Register"
                : activePage === "assignments"
                ? "Assignment Register"
                : activePage === "expenditures"
                ? "Expenditure Register"
                : activePage === "bases"
                ? "Base Registry"
                : activePage === "audit"
                ? "Audit Logs"
                : "System Overview"}
            </h1>
          </div>

          <div className="topbar-right">
            <span className="status-dot"></span>

            <span>
              SECURE SESSION
            </span>

            <div className="role-badge">
              {role}
            </div>
          </div>
        </header>

        {/* ======================================================
            OVERVIEW
        ====================================================== */}

        {activePage === "overview" && (
          <>
            <section className="control-bar">
              <div>
                <span className="control-label">
                  BASE
                </span>

                {role === "ADMIN" ? (
  <select
    value={baseId}
    onChange={(event) =>
      setBaseId(Number(event.target.value))
    }
  >
    {bases.length === 0 ? (
      <option value={baseId}>
        Loading bases...
      </option>
    ) : (
      bases.map((base) => (
        <option key={base.id} value={base.id}>
          {base.name || `Base ${base.id}`}
        </option>
      ))
    )}
  </select>
) : (
  <div className="locked-base">
    {bases.find(
      (base) => Number(base.id) === Number(baseId)
    )?.name || `Base ID ${baseId}`}
  </div>
)}
              </div>

              <div>
                <span className="control-label">
                  FROM
                </span>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) =>
                    setFromDate(
                      event.target.value
                    )
                  }
                />
              </div>

              <div>
                <span className="control-label">
                  TO
                </span>

                <input
                  type="date"
                  value={toDate}
                  onChange={(event) =>
                    setToDate(
                      event.target.value
                    )
                  }
                />
              </div>

              <button
                className="refresh-btn"
                onClick={loadData}
                disabled={dashboardLoading}
              >
                {dashboardLoading
                  ? "LOADING..."
                  : "REFRESH DATA"}
              </button>
            </section>

            {pageError && (
              <div className="dashboard-error">
                {pageError}
              </div>
            )}

            <section className="dashboard-content">
              <div className="section-heading">
                <div>
                  <div className="section-label">
                    INVENTORY POSITION
                  </div>

                  <h2>
                    Base {baseId} Summary
                  </h2>
                </div>

                <div className="period-label">
                  {fromDate} — {toDate}
                </div>
              </div>

              <section className="metric-grid">
                <Metric
                  label="OPENING BALANCE"
                  value={
                    dashboard?.openingBalance ??
                    "—"
                  }
                />

                <Metric
                  label="CLOSING BALANCE"
                  value={
                    dashboard?.closingBalance ??
                    "—"
                  }
                />

                <Metric
                  label="NET MOVEMENT"
                  value={
                    dashboard?.netMovement ??
                    "—"
                  }
                  movement
                />

                <Metric
                  label="ASSIGNED"
                  value={
                    dashboard?.assigned ?? "—"
                  }
                />

                <Metric
                  label="EXPENDED"
                  value={
                    dashboard?.expended ?? "—"
                  }
                  warning
                />
              </section>

              <section className="lower-grid">
                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-label">
                        ASSET REGISTER
                      </div>

                      <h3>
                        Current Assets
                      </h3>
                    </div>

                    <span className="record-count">
                      {assets.length} RECORDS
                    </span>
                  </div>

                  <div
  className="asset-table"
  style={{
    width: "100%",
    overflowX: "auto",
  }}
>
  <div
    className="asset-row asset-header"
    style={{
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr 1.1fr",
      columnGap: "24px",
      alignItems: "center",
      minHeight: "42px",
      padding: "0 24px",
      borderBottom: "1px solid #202720",
    }}
  >
    <span>ASSET</span>
    <span>BASE</span>
    <span>STATUS</span>
  </div>

  {assets.length === 0 ? (
    <div className="no-data">
      No asset records available.
    </div>
  ) : (
    assets.slice(0, 8).map((asset) => (
      <div
        className="asset-row"
        key={asset.id}
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1.1fr",
          columnGap: "24px",
          alignItems: "center",
          minHeight: "48px",
          padding: "0 24px",
          borderBottom: "1px solid #202720",
          color: "#89938b",
          fontSize: "11px",
        }}
      >
        <span
          className="asset-code"
          style={{
            minWidth: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {asset.assetCode}
        </span>

        <span
          style={{
            minWidth: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {asset.base?.name || "—"}
        </span>

        <span>
          <Status status={asset.status} />
        </span>
      </div>
    ))
  )}
</div>
                </div>

                <div className="panel operational-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-label">
                        SYSTEM STATE
                      </div>

                      <h3>
                        Operational Status
                      </h3>
                    </div>
                  </div>

                  <div className="state-list">
                    <StateRow
                      label="AUTHENTICATION"
                      value="VERIFIED"
                    />

                    <StateRow
                      label="AUTHORIZATION"
                      value="ENFORCED"
                    />

                    <StateRow
                      label="DATABASE"
                      value="CONNECTED"
                    />

                    <StateRow
                      label="AUDIT SYSTEM"
                      value={
                        role === "ADMIN"
                          ? "ACTIVE"
                          : "PROTECTED"
                      }
                    />
                  </div>
                </div>
              </section>
            </section>
          </>
        )}

        {/* ======================================================
            ASSETS
        ====================================================== */}

        {activePage === "assets" && (
          <DataPage
            sectionLabel="ASSET REGISTER"
            title="Military Assets"
            count={filteredAssets.length}
            searchValue={assetSearch}
            onSearchChange={setAssetSearch}
            searchPlaceholder="Search asset, type, base or status"
          >
            <div className="table-scroll">
              <div className="data-table assets-table">
                <div className="data-row data-header">
                  <span>ASSET</span>
                  <span>TYPE</span>
                  <span>BASE</span>
                  <span>STATUS</span>
                </div>

                {filteredAssets.length === 0 ? (
                  <EmptyRow text="No asset records available." />
                ) : (
                  filteredAssets.map((asset) => (
                    <div
                      className="data-row"
                      key={asset.id}
                    >
                      <span className="asset-code">
                        {asset.assetCode || "—"}
                      </span>

                      <span>
                        {asset.assetType?.name ||
                          "—"}
                      </span>

                      <span>
                        {asset.base?.name || "—"}
                      </span>

                      <span>
                        <Status
                          status={asset.status}
                        />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DataPage>
        )}

        {/* ======================================================
    PURCHASES
====================================================== */}

{activePage === "purchases" && (
  <>
    <DataPage
      sectionLabel="PROCUREMENT REGISTER"
      title="Purchase Records"
      count={filteredPurchases.length}
      searchValue={purchaseSearch}
      onSearchChange={setPurchaseSearch}
      searchPlaceholder="Search date, asset type, base or quantity"
      actions={
        <button
          type="button"
          className="primary-action-button"
          onClick={async () => {
            setPurchaseFormError("");
            setPurchaseMessage("");

            setPurchaseForm({
              purchaseDate: new Date()
                .toISOString()
                .split("T")[0],
              assetTypeId: "",
              baseId: "",
              quantity: "",
            });

            try {
              const authConfig = {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              };

              const [
                assetTypeResponse,
                baseResponse,
              ] = await Promise.all([
                axios.get(
                  `${API_BASE_URL}/api/asset-types`,
                  authConfig
                ),
                axios.get(
                  `${API_BASE_URL}/api/bases`,
                  authConfig
                ),
              ]);

              const assetTypeData =
                Array.isArray(
                  assetTypeResponse.data
                )
                  ? assetTypeResponse.data
                  : [];

              const baseData =
                Array.isArray(baseResponse.data)
                  ? baseResponse.data
                  : [];

              setAssetTypes(assetTypeData);
              setBases(baseData);

              setPurchaseFormOpen(true);
            } catch (error) {
              console.error(
                "Unable to load purchase options:",
                error
              );

              if (
                error.response?.status === 401
              ) {
                logout();
                return;
              }

              setPurchaseFormError(
                "Unable to load asset types or bases."
              );

              setPurchaseFormOpen(true);
            }
          }}
        >
          + ADD PURCHASE
        </button>
      }
    >
      <div className="table-scroll">
        <div className="data-table purchases-table">
          <div className="data-row data-header">
            <span>DATE</span>
            <span>ASSET TYPE</span>
            <span>BASE</span>
            <span>QUANTITY</span>
          </div>

          {filteredPurchases.length === 0 ? (
            <EmptyRow
              text="No purchase records available."
            />
          ) : (
            filteredPurchases.map((purchase) => (
              <div
                className="data-row"
                key={purchase.id}
              >
                <span>
                  {formatDate(
                    purchase.purchaseDate
                  )}
                </span>

                <span>
                  {purchase.assetType?.name ||
                    "—"}
                </span>

                <span>
                  {purchase.base?.name || "—"}
                </span>

                <span className="numeric-value">
                  {purchase.quantity ?? "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </DataPage>

    {/* PURCHASE FORM MODAL */}
    {purchaseFormOpen && (
  <div className="purchase-modal-overlay">
    <div className="purchase-modal">

      <div className="purchase-modal-header">
        <div>
          <div className="section-label">
            PROCUREMENT ENTRY
          </div>

          <h2>Add Purchase</h2>
        </div>

        <button
          type="button"
          className="modal-close-button"
          onClick={closePurchaseForm}
        >
          ×
        </button>
      </div>

      <form
        className="purchase-form"
        onSubmit={handlePurchaseSubmit}
      >

        <div className="field">
          <label htmlFor="purchaseDate">
            PURCHASE DATE
          </label>

          <input
            id="purchaseDate"
            type="date"
            value={purchaseForm.purchaseDate}
            onChange={(event) =>
              setPurchaseForm((prev) => ({
                ...prev,
                purchaseDate:
                  event.target.value,
              }))
            }
            required
          />
        </div>

        <div className="field">
          <label htmlFor="purchaseAssetType">
            ASSET TYPE
          </label>

          <select
            id="purchaseAssetType"
            value={purchaseForm.assetTypeId}
            onChange={(event) =>
              setPurchaseForm((prev) => ({
                ...prev,
                assetTypeId:
                  event.target.value,
              }))
            }
            required
          >
            <option value="">
              Select Asset Type
            </option>

            {assetTypes.map((assetType) => (
              <option
                key={assetType.id}
                value={assetType.id}
              >
                {assetType.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="purchaseBase">
            BASE
          </label>

          <select
            id="purchaseBase"
            value={purchaseForm.baseId}
            onChange={(event) =>
              setPurchaseForm((prev) => ({
                ...prev,
                baseId: event.target.value,
              }))
            }
            required
          >
            <option value="">
              Select Base
            </option>

            {bases.map((base) => (
              <option
                key={base.id}
                value={base.id}
              >
                {base.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="purchaseQuantity">
            QUANTITY
          </label>

          <input
            id="purchaseQuantity"
            type="number"
            min="1"
            value={purchaseForm.quantity}
            placeholder="Enter quantity"
            onChange={(event) =>
              setPurchaseForm((prev) => ({
                ...prev,
                quantity:
                  event.target.value,
              }))
            }
            required
          />
        </div>

        {purchaseFormError && (
          <div className="form-error-message">
            {purchaseFormError}
          </div>
        )}

        {purchaseMessage && (
          <div className="form-success-message">
            {purchaseMessage}
          </div>
        )}

        <div className="purchase-form-actions">
          <button
            type="button"
            className="secondary-action-button"
            onClick={closePurchaseForm}
          >
            CANCEL
          </button>

          <button
            type="submit"
            className="primary-action-button"
            disabled={purchaseSaving}
          >
            {purchaseSaving
              ? "SAVING..."
              : "SAVE PURCHASE"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}
  </>
)}

        {/* ======================================================
            TRANSFERS
        ====================================================== */}

        {activePage === "transfers" && (
  <>
    <section className="dashboard-content page-content">
      <div className="section-heading">
        <div>
          <div className="section-label">
            MOVEMENT REGISTER
          </div>

          <h2>Transfer Records</h2>
        </div>

        <div className="section-heading-right">
          <div className="data-page-actions">
            <button
              type="button"
              className="primary-action-button"
              onClick={async () => {
                setTransferFormError("");
                setTransferMessage("");

                setTransferForm({
                  assetId: "",
                  fromBaseId: "",
                  toBaseId: "",
                  transferDate: new Date()
                    .toISOString()
                    .slice(0, 16),
                });

                try {
                  const authConfig = {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  };

                  const [assetResponse, baseResponse] =
                    await Promise.all([
                      axios.get(
                        `${API_BASE_URL}/api/assets`,
                        authConfig
                      ),
                      axios.get(
                        `${API_BASE_URL}/api/bases`,
                        authConfig
                      ),
                    ]);

                  const assetData = Array.isArray(
                    assetResponse.data
                  )
                    ? assetResponse.data
                    : [];

                  const baseData = Array.isArray(
                    baseResponse.data
                  )
                    ? baseResponse.data
                    : [];

                  setAssets(assetData);
                  setBases(baseData);
                  setTransferFormOpen(true);
                } catch (error) {
                  console.error(
                    "Unable to load transfer options:",
                    error
                  );

                  if (error.response?.status === 401) {
                    logout();
                    return;
                  }

                  setTransferFormError(
                    "Unable to load assets or bases."
                  );

                  setTransferFormOpen(true);
                }
              }}
            >
              + ADD TRANSFER
            </button>
          </div>

          <span className="record-count">
            {transfers.length} RECORDS
          </span>
        </div>
      </div>

      <div className="panel page-panel">
        <div
  className="transfer-table"
  style={{
    width: "100%",
    overflowX: "auto",
  }}
>
  <div
    className="transfer-row transfer-header"
    style={{
      display: "grid",
      gridTemplateColumns:
        "0.9fr 1fr 1.3fr 1.3fr 0.9fr",
      columnGap: "24px",
      alignItems: "center",
      minWidth: "760px",
      minHeight: "42px",
      padding: "0 24px",
      borderBottom: "1px solid #202720",
    }}
  >
    <span>TRANSFER</span>
    <span>ASSET</span>
    <span>FROM</span>
    <span>TO</span>
    <span>STATUS</span>
  </div>

  {transfers.length === 0 ? (
    <div className="no-data">
      No transfer records available.
    </div>
  ) : (
    transfers.map((transfer) => (
      <div
        className="transfer-row"
        key={transfer.id}
        style={{
          display: "grid",
          gridTemplateColumns:
            "0.9fr 1fr 1.3fr 1.3fr 0.9fr",
          columnGap: "24px",
          alignItems: "center",
          minWidth: "760px",
          minHeight: "52px",
          padding: "0 24px",
          borderBottom: "1px solid #202720",
          color: "#89938b",
          fontSize: "11px",
        }}
      >
        <span
          className="asset-code"
          style={{
            whiteSpace: "nowrap",
          }}
        >
          TR-
          {String(transfer.id).padStart(3, "0")}
        </span>

        <span>
          {transfer.asset?.assetCode || "—"}
        </span>

        <span>
          {transfer.fromBase?.name || "—"}
        </span>

        <span>
          {transfer.toBase?.name || "—"}
        </span>

        <span
          className="transfer-status"
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {transfer.status || "—"}
        </span>
      </div>
    ))
  )}
</div>
      </div>
    </section>

    {transferFormOpen && (
      <div className="purchase-modal-overlay">
        <div className="purchase-modal">
          <div className="purchase-modal-header">
            <div>
              <div className="section-label">
                ASSET MOVEMENT
              </div>

              <h3>Create Transfer</h3>
            </div>

            <button
              type="button"
              className="modal-close-button"
              onClick={closeTransferForm}
            >
              ×
            </button>
          </div>

          <form
            className="purchase-form"
            onSubmit={handleTransferSubmit}
          >
            <div className="field">
              <label htmlFor="transferDate">
                TRANSFER DATE
              </label>

              <input
                id="transferDate"
                type="datetime-local"
                value={transferForm.transferDate}
                onChange={(event) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    transferDate:
                      event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="field">
              <label htmlFor="transferAsset">
                ASSET
              </label>

              <select
                id="transferAsset"
                value={transferForm.assetId}
                onChange={(event) => {
                  const selectedAsset =
                    assets.find(
                      (asset) =>
                        String(asset.id) ===
                        event.target.value
                    );

                  setTransferForm((prev) => ({
                    ...prev,
                    assetId: event.target.value,
                    fromBaseId:
                      selectedAsset?.base?.id
                        ? String(
                            selectedAsset.base.id
                          )
                        : prev.fromBaseId,
                  }));
                }}
                required
              >
                <option value="">
                  Select asset
                </option>

                {assets.map((asset) => (
                  <option
                    key={asset.id}
                    value={asset.id}
                  >
                    {asset.assetCode}
                    {asset.base?.name
                      ? ` — ${asset.base.name}`
                      : ""}
                    {asset.status
                      ? ` (${asset.status})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="transferFromBase">
                SOURCE BASE
              </label>

              <select
                id="transferFromBase"
                value={transferForm.fromBaseId}
                onChange={(event) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    fromBaseId:
                      event.target.value,
                  }))
                }
                required
              >
                <option value="">
                  Select source base
                </option>

                {bases.map((base) => (
                  <option
                    key={base.id}
                    value={base.id}
                  >
                    {base.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="transferToBase">
                DESTINATION BASE
              </label>

              <select
                id="transferToBase"
                value={transferForm.toBaseId}
                onChange={(event) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    toBaseId:
                      event.target.value,
                  }))
                }
                required
              >
                <option value="">
                  Select destination base
                </option>

                {bases.map((base) => (
                  <option
                    key={base.id}
                    value={base.id}
                  >
                    {base.name}
                  </option>
                ))}
              </select>
            </div>

            {transferFormError && (
              <div className="login-error">
                {transferFormError}
              </div>
            )}

            {transferMessage && (
              <div className="success-message">
                {transferMessage}
              </div>
            )}

            <div className="purchase-form-actions">
              <button
                type="button"
                className="secondary-action-button"
                onClick={closeTransferForm}
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="primary-action-button"
                disabled={transferSaving}
              >
                {transferSaving
                  ? "CREATING..."
                  : "CREATE TRANSFER"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
)}

{assignmentFormOpen && (
  <div className="purchase-modal-overlay">
    <div className="purchase-modal">

      <div className="purchase-modal-header">
        <div>
          <div className="section-label">
            ASSET ASSIGNMENT
          </div>

          <h2>Assign Asset</h2>
        </div>

        <button
          type="button"
          className="modal-close-button"
          onClick={closeAssignmentForm}
        >
          ×
        </button>
      </div>

      <form
        className="purchase-form"
        onSubmit={handleAssignmentSubmit}
      >

        <div className="field">
          <label htmlFor="assignmentAsset">
            ASSET
          </label>

          <select
  id="assignmentAsset"
  value={assignmentForm.assetId}
  onChange={(event) => {
    setAssignmentForm((prev) => ({
      ...prev,
      assetId: event.target.value,
      assignedToUserId: "",
    }));
  }}
  required
>
            <option value="">
              Select Available Asset
            </option>

            {assets
              .filter(
                (asset) => asset.status === "AVAILABLE"
              )
              .map((asset) => (
                <option
                  key={asset.id}
                  value={asset.id}
                >
                  {asset.assetCode} —{" "}
                  {asset.assetType?.name || "Unknown Type"} —{" "}
                  {asset.base?.name || "Unknown Base"}
                </option>
              ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="assignmentUser">
            ASSIGN TO USER
          </label>

          <select
            id="assignmentUser"
            value={assignmentForm.assignedToUserId}
            onChange={(event) =>
              setAssignmentForm((prev) => ({
                ...prev,
                assignedToUserId:
                  event.target.value,
              }))
            }
            required
          >
            <option value="">
              Select User
            </option>

            {users
  .filter((user) => {
    if (!assignmentForm.assetId) {
      return true;
    }

    const selectedAsset = assets.find(
      (asset) =>
        String(asset.id) ===
        String(assignmentForm.assetId)
    );

    if (!selectedAsset?.base?.id) {
      return false;
    }

    return (
      Number(user.baseId) ===
      Number(selectedAsset.base.id)
    );
  })
  .map((user) => (
              <option
                key={user.id}
                value={user.id}
              >
                {user.fullName} ({user.username})
                {user.baseName
                  ? ` — ${user.baseName}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        {assignmentFormError && (
          <div className="form-error-message">
            {assignmentFormError}
          </div>
        )}

        {assignmentMessage && (
          <div className="form-success-message">
            {assignmentMessage}
          </div>
        )}

        <div className="purchase-form-actions">

          <button
            type="button"
            className="secondary-action-button"
            onClick={closeAssignmentForm}
          >
            CANCEL
          </button>

          <button
            type="submit"
            className="primary-action-button"
            disabled={assignmentSaving}
          >
            {assignmentSaving
              ? "ASSIGNING..."
              : "ASSIGN ASSET"}
          </button>

        </div>

      </form>
    </div>
  </div>
)}

        {/* ======================================================
            ASSIGNMENTS
        ====================================================== */}

        {activePage === "assignments" && (
  <DataPage
    sectionLabel="ASSET ALLOCATION"
    title="Assignment Records"
    count={filteredAssignments.length}
    searchValue={assignmentSearch}
    onSearchChange={setAssignmentSearch}
    searchPlaceholder="Search asset or assigned operator"
    actions={
      <button
        type="button"
        className="primary-action-button"
        onClick={openAssignmentForm}
      >
        + ASSIGN ASSET
      </button>
    }
  >
            
            <div className="table-scroll">
              <div className="data-table assignments-table">
                <div className="data-row data-header">
                  <span>ASSET</span>
                  <span>ASSIGNED TO</span>
                  <span>USERNAME</span>
                  <span>ASSIGNED DATE</span>
                  <span>RETURNED</span>
                </div>

                {filteredAssignments.length ===
                0 ? (
                  <EmptyRow text="No assignment records available." />
                ) : (
                  filteredAssignments.map(
                    (assignment) => (
                      <div
                        className="data-row"
                        key={assignment.id}
                      >
                        <span className="asset-code">
                          {assignment.asset
                            ?.assetCode ||
                            "—"}
                        </span>

                        <span>
                          {assignment
                            .assignedToUser
                            ?.fullName ||
                            "—"}
                        </span>

                        <span>
                          {assignment
                            .assignedToUser
                            ?.username ||
                            "—"}
                        </span>

                        <span>
                          {formatDateTime(
                            assignment.assignedDate
                          )}
                        </span>

                        <span>
  {assignment.returnedDate ? (
    formatDateTime(
      assignment.returnedDate
    )
  ) : (
    <button
      type="button"
      className="assignment-return-button"
      onClick={() =>
        handleAssignmentReturn(
          assignment.id
        )
      }
      disabled={
        assignmentReturning ===
        assignment.id
      }
    >
      {assignmentReturning ===
      assignment.id
        ? "RETURNING..."
        : "RETURN ASSET"}
    </button>
  )}
</span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </DataPage>
        )}

        {/* ======================================================
            EXPENDITURES
        ====================================================== */}

       {activePage === "expenditures" && (
  <>
    <DataPage
      sectionLabel="EXPENDITURE REGISTER"
      title="Expenditure Records"
      count={filteredExpenditures.length}
      searchValue={expenditureSearch}
      onSearchChange={setExpenditureSearch}
      searchPlaceholder="Search asset, reason or date"
      actions={
        <button
          type="button"
          className="primary-action-button"
          onClick={openExpenditureForm}
        >
          + ADD EXPENDITURE
        </button>
      }
    >
            <div className="table-scroll">
              <div className="data-table expenditures-table">
                <div className="data-row data-header">
                  <span>ASSET</span>
                  <span>DATE</span>
                  <span>REASON</span>
                  <span>BASE</span>
                </div>

                {filteredExpenditures.length ===
                0 ? (
                  <EmptyRow text="No expenditure records available." />
                ) : (
                  filteredExpenditures.map(
                    (expenditure) => (
                      <div
                        className="data-row"
                        key={expenditure.id}
                      >
                        <span className="asset-code">
                          {expenditure.asset
                            ?.assetCode ||
                            "—"}
                        </span>

                        <span>
                          {formatDateTime(
                            expenditure.expenditureDate
                          )}
                        </span>

                        <span>
                          {expenditure.reason ||
                            "—"}
                        </span>

                        <span>
                          {expenditure.asset
                            ?.base?.name ||
                            "—"}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </DataPage>
          {expenditureFormOpen && (
  <div className="purchase-modal-overlay">
    <div className="purchase-modal">

      <div className="purchase-modal-header">
        <div>
          <div className="section-label">
            EXPENDITURE ENTRY
          </div>

          <h2>Record Expenditure</h2>
        </div>

        <button
          type="button"
          className="modal-close-button"
          onClick={closeExpenditureForm}
        >
          ×
        </button>
      </div>

      <form
        className="purchase-form"
        onSubmit={handleExpenditureSubmit}
      >

        <div className="field">
          <label htmlFor="expenditureAsset">
            ASSET
          </label>

          <select
            id="expenditureAsset"
            value={expenditureForm.assetId}
            onChange={(event) =>
              setExpenditureForm((prev) => ({
                ...prev,
                assetId:
                  event.target.value,
              }))
            }
            required
          >
            <option value="">
              Select Assigned Asset
            </option>

            {assets
              .filter(
                (asset) =>
                  asset.status === "ASSIGNED"
              )
              .map((asset) => (
                <option
                  key={asset.id}
                  value={asset.id}
                >
                  {asset.assetCode} —{" "}
                  {asset.assetType?.name ||
                    "Unknown Type"} —{" "}
                  {asset.base?.name ||
                    "Unknown Base"}
                </option>
              ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="expenditureReason">
            REASON
          </label>

          <input
            id="expenditureReason"
            type="text"
            value={expenditureForm.reason}
            placeholder="Enter expenditure reason"
            onChange={(event) =>
              setExpenditureForm((prev) => ({
                ...prev,
                reason: event.target.value,
              }))
            }
            required
          />
        </div>

        {expenditureFormError && (
          <div className="form-error-message">
            {expenditureFormError}
          </div>
        )}

        {expenditureMessage && (
          <div className="form-success-message">
            {expenditureMessage}
          </div>
        )}

        <div className="purchase-form-actions">

          <button
            type="button"
            className="secondary-action-button"
            onClick={closeExpenditureForm}
          >
            CANCEL
          </button>

          <button
            type="submit"
            className="primary-action-button"
            disabled={expenditureSaving}
          >
            {expenditureSaving
              ? "SAVING..."
              : "RECORD EXPENDITURE"}
          </button>

        </div>

      </form>
    </div>
  </div>
)}

  </>
)}
        

        {/* ======================================================
            BASES
        ====================================================== */}

        {activePage === "bases" && (
          <DataPage
            sectionLabel="COMMAND LOCATIONS"
            title="Base Registry"
            count={filteredBases.length}
            searchValue={baseSearch}
            onSearchChange={setBaseSearch}
            searchPlaceholder="Search base name or location"
          >
            <div className="base-card-grid">
              {filteredBases.length === 0 ? (
                <div className="no-data panel-empty">
                  No base records available.
                </div>
              ) : (
                filteredBases.map((base) => (
                  <div
                    className="base-card"
                    key={base.id}
                  >
                    <div className="base-card-top">
                      <span className="base-index">
                        BASE
                      </span>

                      <span className="base-id">
                        #{String(
                          base.id
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    <h3>
                      {base.name || "Unnamed Base"}
                    </h3>

                    <div className="base-location">
                      <span className="location-marker">
                        ●
                      </span>

                      {base.location ||
                        "Location not available"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DataPage>
        )}

        {/* ======================================================
            AUDIT LOGS
        ====================================================== */}

        {activePage === "audit" && (
          <DataPage
            sectionLabel="ACCOUNTABILITY REGISTER"
            title="Audit Logs"
            count={filteredAuditLogs.length}
            searchValue={auditSearch}
            onSearchChange={setAuditSearch}
            searchPlaceholder="Search user, action or entity"
          >
            <div className="table-scroll">
              <div className="data-table audit-table">
                <div className="data-row data-header">
                  <span>USER</span>
                  <span>ACTION</span>
                  <span>ENTITY</span>
                  <span>ENTITY ID</span>
                  <span>TIME</span>
                </div>

                {filteredAuditLogs.length ===
                0 ? (
                  <EmptyRow text="No audit records available." />
                ) : (
                  filteredAuditLogs.map(
                    (log, index) => (
                      <div
                        className="data-row"
                        key={`${log.entityType}-${log.entityId}-${log.createdAt}-${index}`}
                      >
                        <span>
                          {log.username || "—"}
                        </span>

                        <span>
                          <ActionBadge
                            action={
                              log.action
                            }
                          />
                        </span>

                        <span>
                          {log.entityType ||
                            "—"}
                        </span>

                        <span className="asset-code">
                          {log.entityId ?? "—"}
                        </span>

                        <span>
                          {formatDateTime(
                            log.createdAt
                          )}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </DataPage>
        )}
      </main>
    </div>
  );
}

/* ==============================================================
   SHARED COMPONENTS
============================================================== */

function DataPage({
  sectionLabel,
  title,
  count,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  actions,
  children,
}) {
  return (
    <section className="dashboard-content page-content">

      <div className="section-heading">
        <div>
          <div className="section-label">{sectionLabel}</div>
          <h2>{title}</h2>
        </div>

        <div className="section-heading-right">
          {actions && (
            <div className="data-page-actions">
              {actions}
            </div>
          )}

          <span className="record-count">
            {count} RECORDS
          </span>
        </div>
      </div>

      <div className="page-toolbar">
        <div className="table-search">
          <span className="search-icon">
            /
          </span>

          <input
            type="text"
            value={searchValue}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder={searchPlaceholder}
          />

          {searchValue && (
            <button
              className="clear-search"
              onClick={() => onSearchChange("")}
              type="button"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="panel page-panel">
        {children}
      </div>

    </section>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="no-data panel-empty">
      {text}
    </div>
  );
}

function Metric({
  label,
  value,
  movement = false,
  warning = false,
}) {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(value);

  const displayValue =
    movement &&
    value !== "—" &&
    !Number.isNaN(numericValue) &&
    numericValue > 0
      ? `+${numericValue}`
      : value;

  return (
    <div className="metric">
      <div className="metric-label">
        {label}
      </div>

      <div
        className={`metric-value ${
          movement
            ? "metric-movement"
            : ""
        } ${
          warning
            ? "metric-warning"
            : ""
        }`}
      >
        {displayValue}
      </div>
    </div>
  );
}

function Status({ status }) {
  const normalized = String(
    status || ""
  ).toUpperCase();

  let className = "status-neutral";

  if (normalized === "AVAILABLE") {
    className = "status-available";
  }

  if (normalized === "ASSIGNED") {
    className = "status-assigned";
  }

  if (normalized === "EXPENDED") {
    className = "status-expended";
  }

  return (
    <span
      className={`asset-status ${className}`}
    >
      <span className="status-small-dot"></span>
      {normalized || "UNKNOWN"}
    </span>
  );
}

function TransferStatus({ status }) {
  const normalized = String(
    status || ""
  ).toUpperCase();

  return (
    <span className="transfer-status">
      <span className="status-small-dot"></span>
      {normalized || "UNKNOWN"}
    </span>
  );
}

function ActionBadge({ action }) {
  return (
    <span className="action-badge">
      {action || "UNKNOWN"}
    </span>
  );
}

function StateRow({ label, value }) {
  return (
    <div className="state-row">
      <span>{label}</span>

      <strong>
        <span className="status-small-dot"></span>
        {value}
      </strong>
    </div>
  );
}

export default App;
