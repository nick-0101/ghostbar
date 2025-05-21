console.log("Hello, world!");

document.addEventListener("DOMContentLoaded", function () {
  const valueInput = document.getElementById("valueInput");
  const saveButton = document.getElementById("saveButton");
  const status = document.getElementById("status");

  // Load saved value when popup opens
  chrome.storage.local.get(["savedValue"], function (result) {
    if (result.savedValue) {
      valueInput.value = result.savedValue;
    }
  });

  // Save value when button is clicked
  saveButton.addEventListener("click", function () {
    const value = valueInput.value;
    chrome.storage.local.set({ savedValue: value }, function () {
      status.textContent = "Value saved!";
      status.style.color = "green";

      // Clear status message after 2 seconds
      setTimeout(() => {
        status.textContent = "";
      }, 2000);
    });
  });
});
