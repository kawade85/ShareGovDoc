// Global variables for UI integration
let documents = [];
let selectedFiles = [];
let currentView = "grid";
let isUploading = false;

// Authentication state listener
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    loadDocuments();
    updateWelcomeMessage(user);
    initializeUI();
  }
});

// Initialize UI components
function initializeUI() {
  initializeUploadArea();
  initializeSearch();
  updateStats();
}

// Update welcome message with user info
function updateWelcomeMessage(user) {
  const welcomeTitle = document.querySelector(".welcome-title");
  if (welcomeTitle && user.email) {
    welcomeTitle.innerHTML = `
      <i class="fas fa-tachometer-alt"></i>
      Welcome back, ${user.email.split("@")[0]}
    `;
  }
}

// Initialize upload area functionality
function initializeUploadArea() {
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("docFile");
  const uploadBtn = document.getElementById("uploadBtn");

  if (!uploadArea || !fileInput || !uploadBtn) return;

  // Drag and drop functionality
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");

    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  });

  // File input change
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    handleFileSelection(files);
  });

  // Click to upload
  uploadArea.addEventListener("click", (e) => {
    if (e.target === uploadArea || uploadArea.contains(e.target)) {
      fileInput.click();
    }
  });
}

// Handle file selection and display
function handleFileSelection(files) {
  selectedFiles = files;
  const uploadBtn = document.getElementById("uploadBtn");
  const uploadContent = document.getElementById("uploadContent");

  if (files.length > 0) {
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = `<i class="fas fa-upload"></i> Upload ${
      files.length
    } File${files.length > 1 ? "s" : ""}`;

    // Show file preview
    showFilePreview(files);
    showToast(
      "success",
      "Files Selected",
      `${files.length} file${files.length > 1 ? "s" : ""} ready for upload`
    );
  } else {
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected';
    resetUploadArea();
  }
}

// Show file preview in upload area
function showFilePreview(files) {
  const uploadContent = document.getElementById("uploadContent");
  let previewHTML = '<div class="file-preview-list">';

  files.forEach((file, index) => {
    const fileSize = formatFileSize(file.size);
    const fileIcon = getFileIcon(file.type || file.name);

    previewHTML += `
      <div class="preview-item">
        <div class="preview-icon">
          <i class="${fileIcon}"></i>
        </div>
        <div class="preview-info">
          <div class="preview-name">${file.name}</div>
          <div class="preview-size">${fileSize}</div>
        </div>
        <button class="preview-remove" onclick="removeFile(${index})" title="Remove file">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });

  previewHTML += "</div>";
  uploadContent.innerHTML = previewHTML;
}

// Remove file from selection
function removeFile(index) {
  selectedFiles.splice(index, 1);
  const fileInput = document.getElementById("docFile");

  if (selectedFiles.length === 0) {
    resetUploadArea();
    const uploadBtn = document.getElementById("uploadBtn");
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected';
    fileInput.value = "";
  } else {
    showFilePreview(selectedFiles);
    const uploadBtn = document.getElementById("uploadBtn");
    uploadBtn.innerHTML = `<i class="fas fa-upload"></i> Upload ${
      selectedFiles.length
    } File${selectedFiles.length > 1 ? "s" : ""}`;
  }
}

// Reset upload area to initial state
function resetUploadArea() {
  const uploadContent = document.getElementById("uploadContent");
  uploadContent.innerHTML = `
    <div class="upload-icon">
      <i class="fas fa-cloud-upload-alt"></i>
    </div>
    <div class="upload-text">
      <span class="upload-main-text">Drop files here or click to upload</span>
      <span class="upload-sub-text">Supports PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)</span>
    </div>
  `;
}

// Trigger file input
function triggerFileInput() {
  document.getElementById("docFile").click();
}

// Enhanced upload function with Firebase integration
async function uploadDocument() {
  if (selectedFiles.length === 0) {
    showToast("error", "No Files Selected", "Please select files to upload");
    return;
  }

  if (isUploading) return;
  isUploading = true;

  const uploadBtn = document.getElementById("uploadBtn");
  const progressContainer = document.getElementById("uploadProgress");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");

  // Show progress UI
  progressContainer.style.display = "block";
  uploadBtn.classList.add("loading");
  uploadBtn.disabled = true;

  try {
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const progress = ((i + 1) / selectedFiles.length) * 100;

      // Update progress bar
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `Uploading ${i + 1}/${
        selectedFiles.length
      } - ${Math.round(progress)}%`;

      try {
        // Convert file to Base64
        const base64Data = await fileToBase64(file);

        // Save to Firestore (simplified structure to match your original)
        await db.collection("documents").add({
          userId: auth.currentUser.uid,
          fileName: file.name,
          fileData: base64Data,
          fileSize: file.size,
          fileType: file.type,
          timestamp: new Date(),
        });

        logAction("Document Uploaded", file.name);
        successCount++;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        logAction("Upload Error", `${file.name}: ${error.message}`);
        errorCount++;
      }
    }

    // Show results
    if (successCount > 0) {
      showToast(
        "success",
        "Upload Complete",
        `${successCount} file${
          successCount > 1 ? "s" : ""
        } uploaded successfully`
      );
    }

    if (errorCount > 0) {
      showToast(
        "error",
        "Upload Errors",
        `${errorCount} file${errorCount > 1 ? "s" : ""} failed to upload`
      );
    }

    // Reset upload area
    resetUploadArea();
    selectedFiles = [];
    document.getElementById("docFile").value = "";

    // Reload documents
    await loadDocuments();
  } catch (error) {
    showToast("error", "Upload Failed", "An unexpected error occurred");
    console.error("Upload error:", error);
    logAction("Upload Error", error.message);
  } finally {
    // Hide progress and reset UI
    progressContainer.style.display = "none";
    uploadBtn.classList.remove("loading");
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected';
    isUploading = false;
  }
}

// Convert file to Base64 (Promise-based)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// FIXED: Enhanced load documents function without orderBy to avoid index issues
async function loadDocuments() {
  try {
    console.log("Loading documents...");
    showLoadingState();

    // Simplified query without orderBy to avoid index issues
    const snapshot = await db
      .collection("documents")
      .where("userId", "==", auth.currentUser.uid)
      .get();

    console.log("Documents fetched:", snapshot.size);
    documents = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Document data:", data);

      documents.push({
        id: doc.id,
        name: data.fileName,
        size: data.fileSize || 0,
        type: data.fileType || getFileTypeFromName(data.fileName),
        uploadDate: data.timestamp ? data.timestamp.toDate() : new Date(),
        url: data.fileData,
        firebaseId: doc.id,
      });
    });

    // Sort documents by date on client side (newest first)
    documents.sort((a, b) => b.uploadDate - a.uploadDate);

    console.log("Processed documents:", documents.length);

    renderDocuments();
    updateStats();
    hideLoadingState();
  } catch (error) {
    console.error("Error loading documents:", error);
    showToast(
      "error",
      "Loading Failed",
      `Could not load your documents: ${error.message}`
    );
    hideLoadingState();

    // Show empty state on error
    const docList = document.getElementById("docList");
    const emptyState = document.getElementById("emptyState");
    docList.innerHTML = "";
    emptyState.classList.add("show");
  }
}

// Show loading state
function showLoadingState() {
  const docList = document.getElementById("docList");
  const emptyState = document.getElementById("emptyState");

  emptyState.classList.remove("show");
  docList.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading your documents...</p>
    </div>
  `;
}

// Hide loading state
function hideLoadingState() {
  const loadingState = document.querySelector(".loading-state");
  if (loadingState) {
    loadingState.remove();
  }
}

// Render documents in the new UI
function renderDocuments() {
  const docList = document.getElementById("docList");
  const emptyState = document.getElementById("emptyState");

  console.log("Rendering documents:", documents.length);

  if (documents.length === 0) {
    docList.innerHTML = "";
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");

  const documentsHTML = documents
    .map((doc) => {
      const fileIcon = getFileIcon(doc.type || doc.name);
      const fileSize = formatFileSize(doc.size);
      const uploadDate = formatDate(doc.uploadDate);
      const iconClass = getIconClass(doc.type || doc.name);

      return `
      <div class="document-card" data-id="${doc.id}">
        <div class="document-header">
          <div class="document-icon ${iconClass}">
            <i class="${fileIcon}"></i>
          </div>
          <div class="document-info">
            <div class="document-name">${doc.name}</div>
            <div class="document-meta">
              <div class="document-size">${fileSize}</div>
              <div class="document-date">Uploaded ${uploadDate}</div>
            </div>
          </div>
        </div>
        <div class="document-actions">
          <button class="action-btn download" onclick="downloadDocument('${doc.id}')">
            <i class="fas fa-download"></i>
            Download
          </button>
          <button class="action-btn delete" onclick="confirmDelete('${doc.id}', '${doc.name}')">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  docList.innerHTML = documentsHTML;
}

// FIXED: Use your original deleteDoc function name and structure
async function deleteDoc(id, name) {
  try {
    await db.collection("documents").doc(id).delete();
    logAction("Document Deleted", name);
    showToast(
      "success",
      "Document Deleted",
      `${name} has been deleted successfully`
    );
    loadDocuments(); // Reload documents after deletion
  } catch (error) {
    console.error("Delete failed:", error);
    showToast(
      "error",
      "Delete Failed",
      `Could not delete ${name}: ${error.message}`
    );
    logAction("Delete Error", `${name}: ${error.message}`);
  }
}

// Enhanced delete function that calls your original deleteDoc
async function deleteDocument(docId) {
  const doc = documents.find((d) => d.id === docId);
  if (!doc) return;

  try {
    // Show loading state on delete button
    const deleteBtn = document.querySelector(
      `[onclick="confirmDelete('${docId}', '${doc.name}')"]`
    );
    if (deleteBtn) {
      deleteBtn.classList.add("loading");
      deleteBtn.disabled = true;
    }

    // Use your original deleteDoc function
    await deleteDoc(doc.firebaseId, doc.name);

    // Close modal and update UI
    closeModal("deleteModal");
  } catch (error) {
    console.error("Error deleting document:", error);
    showToast("error", "Delete Failed", `Could not delete ${doc.name}`);
  }
}

// Enhanced delete with confirmation
function confirmDelete(docId, fileName) {
  const modal = document.getElementById("deleteModal");
  const fileNameSpan = document.getElementById("deleteFileName");
  const confirmBtn = document.getElementById("confirmDeleteBtn");

  fileNameSpan.textContent = fileName;
  confirmBtn.onclick = () => {
    deleteDocument(docId);
  };

  showModal("deleteModal");
}

// Enhanced download function
function downloadDocument(docId) {
  const doc = documents.find((d) => d.id === docId);
  if (!doc) {
    showToast("error", "Download Failed", "Document not found");
    return;
  }

  try {
    // Create download link
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("success", "Download Started", `${doc.name} is being downloaded`);
    logAction("Document Downloaded", doc.name);
  } catch (error) {
    console.error("Error downloading document:", error);
    showToast("error", "Download Failed", `Could not download ${doc.name}`);
  }
}

// Enhanced preview function
function previewDocument(docId) {
  const doc = documents.find((d) => d.id === docId);
  if (!doc) return;

  const modal = document.getElementById("previewModal");
  const title = document.getElementById("previewTitle");
  const container = document.getElementById("previewContainer");
  const downloadBtn = document.getElementById("downloadFromPreview");

  title.textContent = doc.name;

  // Enhanced preview based on file type
  if (doc.type && doc.type.includes("image")) {
    container.innerHTML = `
      <div class="image-preview">
        <img src="${doc.url}" alt="${doc.name}" style="max-width: 100%; max-height: 500px; object-fit: contain; border-radius: 8px;">
      </div>
    `;
  } else if (doc.type && doc.type.includes("text")) {
    container.innerHTML = `
      <div class="file-preview-placeholder">
        <i class="fas fa-file-alt" style="font-size: 4rem; color: #f59e0b; margin-bottom: 1rem;"></i>
        <h4>Text Document</h4>
        <p>Preview not available for text files</p>
        <p class="file-info">Size: ${formatFileSize(doc.size)}</p>
      </div>
    `;
  } else if (doc.type && doc.type.includes("pdf")) {
    container.innerHTML = `
      <div class="file-preview-placeholder">
        <i class="fas fa-file-pdf" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
        <h4>PDF Document</h4>
        <p>Click download to view this PDF</p>
        <p class="file-info">Size: ${formatFileSize(doc.size)}</p>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="file-preview-placeholder">
        <i class="fas fa-file" style="font-size: 4rem; color: #6b7280; margin-bottom: 1rem;"></i>
        <h4>Document</h4>
        <p>Preview not available for this file type</p>
        <p class="file-info">Size: ${formatFileSize(doc.size)}</p>
      </div>
    `;
  }

  downloadBtn.onclick = () => downloadDocument(docId);
  showModal("previewModal");

  logAction("Document Previewed", doc.name);
}

// Enhanced logout function
async function logoutUser() {
  if (confirm("Are you sure you want to logout?")) {
    showToast("info", "Logging Out", "You are being logged out...");

    setTimeout(() => {
      auth.signOut().then(() => {
        window.location.href = "index.html";
      });
    }, 1000);
  }
}

// Utility function to update statistics
function updateStats() {
  const totalDocs = documents.length;
  const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);

  const totalDocsElement = document.getElementById("totalDocs");
  const totalSizeElement = document.getElementById("totalSize");

  if (totalDocsElement) {
    totalDocsElement.textContent = totalDocs;
  }

  if (totalSizeElement) {
    totalSizeElement.textContent = formatFileSize(totalSize);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl/Cmd + U for upload
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      triggerFileInput();
    }

    // Escape to close modals
    if (e.key === "Escape") {
      const openModal = document.querySelector(".modal.show");
      if (openModal) {
        closeModal(openModal.id);
      }
    }
  });
});

// Search functionality
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterDocuments(e.target.value);
    }, 300);
  });
}

function filterDocuments(searchTerm = "") {
  const searchInput = document.getElementById("searchInput");
  const term =
    searchTerm || (searchInput ? searchInput.value.toLowerCase() : "");

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(term)
  );

  renderFilteredDocuments(filteredDocs);
}

function renderFilteredDocuments(filteredDocs) {
  const docList = document.getElementById("docList");
  const emptyState = document.getElementById("emptyState");

  if (filteredDocs.length === 0) {
    docList.innerHTML = "";
    emptyState.innerHTML = `
      <div class="empty-icon">
        <i class="fas fa-search"></i>
      </div>
      <h3>No documents found</h3>
      <p>Try adjusting your search terms</p>
    `;
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");

  const documentsHTML = filteredDocs
    .map((doc) => {
      const fileIcon = getFileIcon(doc.type || doc.name);
      const fileSize = formatFileSize(doc.size);
      const uploadDate = formatDate(doc.uploadDate);
      const iconClass = getIconClass(doc.type || doc.name);

      console.log(doc);

      return `
      <div class="document-card" data-id="${doc.id}">
        <div class="document-header">
          <div class="document-icon ${iconClass}">
            <i class="${fileIcon}"></i>
          </div>
          <div class="document-info">
            <div class="document-name">${doc.name}</div>
            <div class="document-meta">
              <div class="document-size">${fileSize}</div>
              <div class="document-date">Uploaded ${uploadDate}</div>
            </div>
          </div>
        </div>
        <div class="document-actions">
          <button class="action-btn preview" onclick="previewDocument('${doc.id}')">
            <i class="fas fa-eye"></i>
            Preview
          </button>
          <button class="action-btn download" onclick="downloadDocument('${doc.id}')">
            <i class="fas fa-download"></i>
            Download
          </button>
          <button class="action-btn delete" onclick="confirmDelete('${doc.id}', '${doc.name}')">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  docList.innerHTML = documentsHTML;
}

// View toggle
function toggleView(view) {
  currentView = view;
  const docList = document.getElementById("docList");
  const viewBtns = document.querySelectorAll(".view-btn");

  viewBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  if (view === "list") {
    docList.classList.add("list-view");
  } else {
    docList.classList.remove("list-view");
  }
}

// Modal functions
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
}

// Toast notification system
function showToast(type, title, message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toastId = "toast-" + Date.now();

  const iconMap = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    info: "fas fa-info-circle",
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.id = toastId;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="${iconMap[type]}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="closeToast('${toastId}')">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    closeToast(toastId);
  }, 5000);
}

function closeToast(toastId) {
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.style.animation = "slideOutRight 0.3s ease forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    closeModal(e.target.id);
  }
});

// Utility functions
function getFileIcon(fileType) {
  if (!fileType) return "fas fa-file";

  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return "fas fa-file-pdf";
  if (type.includes("word") || type.includes("doc")) return "fas fa-file-word";
  if (type.includes("image") || type.includes("jpg") || type.includes("png"))
    return "fas fa-file-image";
  if (type.includes("text") || type.includes("txt")) return "fas fa-file-alt";
  return "fas fa-file";
}

function getIconClass(fileType) {
  if (!fileType) return "default";

  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return "pdf";
  if (type.includes("word") || type.includes("doc")) return "doc";
  if (type.includes("image") || type.includes("jpg") || type.includes("png"))
    return "image";
  if (type.includes("text") || type.includes("txt")) return "text";
  return "default";
}

function getFileTypeFromName(fileName) {
  if (!fileName) return "application/octet-stream";

  const ext = fileName.split(".").pop().toLowerCase();
  const typeMap = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  };
  return typeMap[ext] || "application/octet-stream";
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(date) {
  if (!date) return "Unknown";

  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "today";
  if (diffDays === 2) return "yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;

  return date.toLocaleDateString();
}

// Add some CSS for loading states and preview placeholders
const additionalStyles = document.createElement("style");
additionalStyles.textContent = `
  .file-preview-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  .preview-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(51, 65, 85, 0.3);
    border-radius: 8px;
    border: 1px solid rgba(51, 65, 85, 0.5);
    transition: all 0.3s ease;
  }
  
  .preview-item:hover {
    background: rgba(51, 65, 85, 0.5);
  }
  
  .preview-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.1rem;
  }
  
  .preview-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .preview-name {
    font-weight: 500;
    color: #f1f5f9;
    font-size: 0.9rem;
    word-break: break-word;
  }
  
  .preview-size {
    font-size: 0.8rem;
    color: #94a3b8;
  }
  
  .preview-remove {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    border-radius: 6px;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .preview-remove:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: translateY(-1px);
  }
  
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #94a3b8;
    grid-column: 1 / -1;
  }
  
  .loading-spinner {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #06b6d4;
  }
  
  .file-preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
  }
  
  .file-preview-placeholder h4 {
    color: #f1f5f9;
    margin: 0.5rem 0;
  }
  
  .file-preview-placeholder p {
    margin: 0.25rem 0;
  }
  
  .file-info {
    font-size: 0.9rem;
    color: #06b6d4 !important;
    font-weight: 500;
  }
  
  .image-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }
  
  .upload-area.drag-over {
    border-color: #06b6d4;
    background: rgba(6, 182, 212, 0.1);
    transform: translateY(-2px);
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(additionalStyles);
