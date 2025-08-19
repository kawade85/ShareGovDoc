// let confirmationResult;

// // Validate phone number format
// function getPhoneNumber() {
//   const input = document.getElementById("phoneNumber").value.trim();
//   if (!input.startsWith("+")) {
//     alert("Phone number must start with + (e.g., +91XXXXXXXXXX)");
//     return null;
//   }
//   if (input.length < 10) {
//     alert("Please enter a valid phone number");
//     return null;
//   }
//   return input;
// }

// // Send OTP
// async function sendOTP() {
//   const phoneNumber = getPhoneNumber();
//   if (!phoneNumber) return;

//   try {
//     // Invisible reCAPTCHA
//     window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
//       size: 'invisible'
//     });

//     confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
//     document.getElementById('regMsg').textContent = "OTP Sent to " + phoneNumber;
//     logAction("OTP Sent", phoneNumber);
//   } catch (error) {
//     document.getElementById('regMsg').textContent = "OTP Error: " + error.message;
//     console.error(error);
//     logAction("OTP Error", error.message);
//   }
// }

// // Verify OTP and Register
// async function verifyOTP() {
//   try {
//     const code = document.getElementById('otpCode').value.trim();
//     if (!code) {
//       alert("Please enter the OTP");
//       return;
//     }

//     const result = await confirmationResult.confirm(code);
//     const phoneUser = result.user;
//     logAction("OTP Verified", phoneUser.phoneNumber);

//     const email = document.getElementById('regEmail').value.trim();
//     const password = document.getElementById('regPassword').value.trim();
    
//     // Create Email/Password account
//     const emailUser = await auth.createUserWithEmailAndPassword(email, password);

//     // Store user in Firestore
//     await db.collection("users").doc(emailUser.user.uid).set({
//       email: email,
//       phone: phoneUser.phoneNumber,
//       family: []
//     });

//     alert("Registration successful!");
//     window.location.href = "dashboard.html";

//   } catch (error) {
//     document.getElementById('regMsg').textContent = "Verification Error: " + error.message;
//     console.error(error);
//     logAction("Verification Error", error.message);
//   }
// }

// // Logout
// async function logoutUser() {
//   await auth.signOut();
//   window.location.href = "index.html";
// }






// ------------------04-08-2025-------------------new code spark free approach----------------------

// let confirmationResult;

// // ——————————————————————
// // 1) Configure test mode numbers
// // ——————————————————————
// const TEST_PHONE_NUMBERS = {
//   "+918149223086": "123456", // Example test number with OTP
//   "+919876543210": "654321"  // Add more if needed
// };

// function isTestNumber(phone) {
//   return TEST_PHONE_NUMBERS.hasOwnProperty(phone);
// }

// // ——————————————————————
// // 2) Validate phone number format
// // ——————————————————————
// function getPhoneNumber() {
//   const input = document.getElementById("phoneNumber").value.trim();
//   if (!input.startsWith("+")) {
//     alert("Phone number must start with + (e.g., +91XXXXXXXXXX)");
//     return null;
//   }
//   if (input.length < 10) {
//     alert("Please enter a valid phone number");
//     return null;
//   }
//   return input;
// }

// // ——————————————————————
// // 3) Send OTP (Spark free approach)
// // ——————————————————————
// async function sendOTP() {
//   const phoneNumber = getPhoneNumber();
//   if (!phoneNumber) return;

//   try {
//     // 3a) If test number → no SMS, simulate OTP
//     if (isTestNumber(phoneNumber)) {
//       window.confirmationResult = {
//         confirm: async (code) => {
//           if (code === TEST_PHONE_NUMBERS[phoneNumber]) {
//             // Simulate a Firebase user object
//             return {
//               user: { phoneNumber: phoneNumber, uid: "TEST-" + Date.now() }
//             };
//           } else {
//             throw new Error("Invalid test OTP");
//           }
//         }
//       };
//       document.getElementById('regMsg').textContent =
//         `Test OTP: ${TEST_PHONE_NUMBERS[phoneNumber]} (use for dev)`;
//       logAction("OTP Simulated", phoneNumber);
//       return;
//     }

//     // 3b) Real OTP path (needs Blaze plan to send SMS)
//     window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
//       size: 'invisible'
//     });

//     confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
//     document.getElementById('regMsg').textContent = "OTP Sent to " + phoneNumber;
//     logAction("OTP Sent", phoneNumber);
//   } catch (error) {
//     document.getElementById('regMsg').textContent = "OTP Error: " + error.message;
//     console.error(error);
//     logAction("OTP Error", error.message);
//   }
// }

// // ——————————————————————
// // 4) Verify OTP & Register
// // ——————————————————————
// async function verifyOTP() {
//   try {
//     const code = document.getElementById('otpCode').value.trim();
//     if (!code) {
//       alert("Please enter the OTP");
//       return;
//     }

//     const result = await window.confirmationResult.confirm(code);
//     const phoneUser = result.user;
//     logAction("OTP Verified", phoneUser.phoneNumber);

//     const email = document.getElementById('regEmail').value.trim();
//     const password = document.getElementById('regPassword').value.trim();
    
//     // Create Email/Password account
//     const emailUser = await auth.createUserWithEmailAndPassword(email, password);

//     // Store user in Firestore
//     await db.collection("users").doc(emailUser.user.uid).set({
//       email: email,
//       phone: phoneUser.phoneNumber,
//       family: []
//     });

//     alert("Registration successful!");
//     window.location.href = "dashboard.html";

//   } catch (error) {
//     document.getElementById('regMsg').textContent = "Verification Error: " + error.message;
//     console.error(error);
//     logAction("Verification Error", error.message);
//   }
// }

// // ——————————————————————
// // 5) Logout
// // ——————————————————————
// async function logoutUser() {
//   await auth.signOut();
//   window.location.href = "index.html";
// }
// window.logoutUser = logoutUser;



//------------------------05-08-2025--------------------logout error solved-----------


// ===============================
// Firebase Phone Auth (Spark Plan)
// ===============================

let confirmationResult;

// ——————————————————————
// 1) Configure test mode numbers
// ——————————————————————
const TEST_PHONE_NUMBERS = {
  "+919130555669": "123456", // Example test number with OTP
  "+919028762236": "654321" ,
  "+918668443661" : "111111"// Add more if needed
};

function isTestNumber(phone) {
  return TEST_PHONE_NUMBERS.hasOwnProperty(phone);
}

// ——————————————————————
// 2) Validate phone number format
// ——————————————————————
function getPhoneNumber() {
  const input = document.getElementById("phoneNumber").value.trim();
  if (!input.startsWith("+")) {
    alert("Phone number must start with + (e.g., +91XXXXXXXXXX)");
    return null;
  }
  if (input.length < 10) {
    alert("Please enter a valid phone number");
    return null;
  }
  return input;
}

// ——————————————————————
// 3) Send OTP (Spark free approach)
// ——————————————————————
async function sendOTP() {
  const phoneNumber = getPhoneNumber();
  if (!phoneNumber) return;

  try {
    // 3a) If test number → no SMS, simulate OTP
    if (isTestNumber(phoneNumber)) {
      window.confirmationResult = {
        confirm: async (code) => {
          if (code === TEST_PHONE_NUMBERS[phoneNumber]) {
            // Simulate a Firebase user object for test mode
            return {
              user: { phoneNumber: phoneNumber, uid: "TEST-" + Date.now() }
            };
          } else {
            throw new Error("Invalid test OTP");
          }
        }
      };
      document.getElementById('regMsg').textContent =
        `Test OTP: ${TEST_PHONE_NUMBERS[phoneNumber]} (use for dev/testing)`;
      logAction("OTP Simulated", phoneNumber);
      return;
    }

    // 3b) Real OTP path (needs Blaze plan to send SMS)
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible'
    });

    confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
    document.getElementById('regMsg').textContent = "OTP Sent to " + phoneNumber;
    logAction("OTP Sent", phoneNumber);
  } catch (error) {
    document.getElementById('regMsg').textContent = "OTP Error: " + error.message;
    console.error(error);
    logAction("OTP Error", error.message);
  }
}

// ——————————————————————
// 4) Verify OTP & Register
// ——————————————————————
async function verifyOTP() {
  try {
    const code = document.getElementById('otpCode').value.trim();
    if (!code) {
      alert("Please enter the OTP");
      return;
    }

    const result = await window.confirmationResult.confirm(code);
    const phoneUser = result.user;
    logAction("OTP Verified", phoneUser.phoneNumber);

    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    // Validate email/password
    if (!email || !password) {
      alert("Email and Password are required!");
      return;
    }

    // Create Email/Password account
    const emailUser = await auth.createUserWithEmailAndPassword(email, password);

    // Store user in Firestore
    await db.collection("users").doc(emailUser.user.uid).set({
      email: email,
      phone: phoneUser.phoneNumber,
      family: []
    });

    alert("Registration successful!");
    window.location.href = "dashboard.html";

  } catch (error) {
    document.getElementById('regMsg').textContent = "Verification Error: " + error.message;
    console.error(error);
    logAction("Verification Error", error.message);
  }
}

// ——————————————————————
// 5) Logout (Fix global scope for onclick)
// ——————————————————————
async function logoutUser() {
  try {
    await auth.signOut();
    logAction("Logout", "User signed out successfully");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout Error:", error);
    alert("Logout failed: " + error.message);
  }
}

// ✅ Expose logoutUser to global window for HTML onclick
window.logoutUser = logoutUser;



// =====================
// 6) LOGIN FUNCTION
// =====================
async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    alert("Please enter Email and Password");
    return;
  }

  try {
    // Firebase Email/Password login
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Log and redirect
    logAction("Login Success", user.email);
    alert("Login successful!");
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error("Login Error:", error);
    document.getElementById('loginMsg').textContent = "Login Error: " + error.message;
    logAction("Login Error", error.message);
  }
}

// Make it global for onclick
window.loginUser = loginUser;
