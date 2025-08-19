function logAction(action, details="") {
  const time = new Date().toLocaleString();
  console.log(`[${time}] ${action} ${details}`);
}
