function validatePassword() {
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const confirmError = document.getElementById("confirmError");

      if (password !== confirmPassword) {
        confirmError.textContent = "Passwords must match.";
        confirmError.style.display = "block";
        return false; // Prevent form submit
      }

      confirmError.style.display = "none";
      return true; // Allow submit
    }
