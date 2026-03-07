import React, { useEffect, useRef, useState } from "react";

const QRScanner = () => {
  const [decodedText, setDecodedText] = useState("Waiting for scan...");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const scannerInstance = useRef(null);
  let hasScanned = useRef(false); // useRef to persist across renders

  const genuineManufacturers = [
    "Pfizer",
    "Cipla",
    "Sun Pharma",
    "Dr. Reddy's",
    "Abbott",
  ];

  const loadScript = () => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/html5-qrcode";
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setDecodedText("❌ Failed to load QR script.");
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadScript();
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !window.Html5Qrcode) return;

    const html5QrCode = new window.Html5Qrcode("reader");

    const onScanSuccess = async (text) => {
      if (hasScanned.current) return; // avoid re-scanning
      hasScanned.current = true;

      try {
        const medicineData = JSON.parse(text);

        // Case-insensitive manufacturer check
        const isGenuine = genuineManufacturers.some(
          (g) => g.toLowerCase() === medicineData.manufacturer?.toLowerCase()
        );

        if (!isGenuine) {
          setDecodedText(`❌ Not a genuine manufacturer: ${medicineData.manufacturer}`);
          hasScanned.current = false;
          return;
        }

        const currentDate = new Date();
        const expiryDate = new Date(medicineData.expiry_date);

        if (expiryDate < currentDate) {
          setDecodedText("❌ Medicine is expired and cannot be added.");
          hasScanned.current = false;
          return;
        }

        const response = await fetch("http://localhost:5000/api/v1/medicine", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: new URLSearchParams({
            name: medicineData.name,
            manufacturer: medicineData.manufacturer,
            batch_number: medicineData.batch_number,
            quantity: medicineData.quantity,
            price: medicineData.price,
            expiry_date: medicineData.expiry_date,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setDecodedText("✅ Medicine added successfully!");
          if (scannerInstance.current && scannerInstance.current._isScanning) {
            scannerInstance.current
              .stop()
              .then(() => scannerInstance.current.clear())
              .catch((err) =>
                setDecodedText("❌ Error stopping the scanner: " + err)
              );
          }
        } else {
          setDecodedText("❌ Failed to add medicine: " + result.message);
          hasScanned.current = false;
        }
      } catch (error) {
        console.error("QR parse error:", error);
        setDecodedText("❌ Invalid QR code data.");
        hasScanned.current = false;
      }
    };

    window.Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices.length) {
          const cameraId = devices[0].id;
          html5QrCode
            .start(cameraId, { fps: 10, qrbox: 250 }, onScanSuccess)
            .catch((err) => setDecodedText("❌ Camera error: " + err));
          scannerInstance.current = html5QrCode;
        } else {
          setDecodedText("❌ No camera found.");
        }
      })
      .catch((err) => setDecodedText("❌ Failed to access camera: " + err));

    return () => {
      if (scannerInstance.current && scannerInstance.current._isScanning) {
        scannerInstance.current
          .stop()
          .then(() => scannerInstance.current.clear())
          .catch(() => {});
      }
    };
  }, [isScriptLoaded]);

  return (
    <div style={styles.container}>
      <h2>QR Code Scanner</h2>
      <div id="reader" style={styles.reader}></div>
      <p style={styles.result}>{decodedText}</p>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial",
    textAlign: "center",
    padding: "2rem",
  },
  reader: {
    width: "300px",
    margin: "0 auto",
  },
  result: {
    marginTop: "1rem",
    fontSize: "1.2rem",
    color: "green",
    wordBreak: "break-word",
  },
};

export default QRScanner;
