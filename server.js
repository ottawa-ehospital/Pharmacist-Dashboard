const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let prescriptions = []; // Mock database

// Handle sending prescription
app.post("/api/send-prescription", (req, res) => {
  const { prescriptionData } = req.body;

  if (
    !prescriptionData ||
    !prescriptionData.image ||
    !prescriptionData.timestamp ||
    !prescriptionData.medicationName ||
    !prescriptionData.diagnosis ||
    !prescriptionData.startDate ||
    !prescriptionData.endDate
  ) {
    return res.status(400).json({ message: "Invalid prescription data." });
  }

  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const imageBuffer = Buffer.from(
    prescriptionData.image.split(";base64,").pop(),
    "base64"
  );
  const imagePath = path.join(uploadsDir, `prescription-${Date.now()}.png`);

  fs.writeFile(imagePath, imageBuffer, (err) => {
    if (err) {
      console.error("Error saving prescription:", err);
      return res.status(500).json({ message: "Failed to save prescription." });
    }

    // Store prescription data
    prescriptions.push({
      imagePath: `http://localhost:${PORT}/uploads/${path.basename(imagePath)}`,
      timestamp: prescriptionData.timestamp,
      medicationName: prescriptionData.medicationName,
      diagnosis: prescriptionData.diagnosis,
      startDate: prescriptionData.startDate,
      endDate: prescriptionData.endDate,
    });

    res.status(200).json({ message: "Prescription sent successfully" });
  });
});

// Handle fetching prescriptions
app.get("/api/get-prescriptions", (req, res) => {
  if (prescriptions.length === 0) {
    return res.status(404).json({ message: "No prescriptions found" });
  }
  res.status(200).json(prescriptions);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
