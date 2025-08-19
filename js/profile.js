auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("userEmail").textContent = user.email || "";
    const doc = await db.collection("users").doc(user.uid).get();
    if (doc.exists) {
      const data = doc.data();
      document.getElementById("userPhone").textContent = data.phone || "";
      displayFamily(data.family || []);
    }
  }
});

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

function displayFamily(family) {
  const list = document.getElementById("familyList");
  list.innerHTML = "";
  family.forEach((member) => {
    const li = document.createElement("li");
    li.textContent = member;
    list.appendChild(li);
  });
}

async function addFamilyMember() {
  try {
    const member = document.getElementById("familyMember").value;
    if (!member) return;

    const ref = db.collection("users").doc(auth.currentUser.uid);
    await ref.update({
      family: firebase.firestore.FieldValue.arrayUnion(member),
    });

    document.getElementById("profileMsg").textContent =
      "Member added successfully";
    logAction("Family Member Added", member);
    document.getElementById("familyMember").value = "";

    const doc = await ref.get();
    displayFamily(doc.data().family || []);
  } catch (error) {
    document.getElementById("profileMsg").textContent = error.message;
  }
}
