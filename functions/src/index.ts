import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import {defineString} from "firebase-functions/params";
import * as twilio from "twilio";
import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import {PDFDocument, rgb, StandardFonts} from "pdf-lib";
import axios from "axios";

admin.initializeApp();
const db = admin.firestore();

// Environment variables for email configuration
const gmailEmail = defineString("GMAIL_EMAIL");
const gmailAppPass = defineString("GMAIL_APP_PASS");

// Environment variables for Twilio configuration
const twilioAccountSid = defineString("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineString("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = defineString("TWILIO_PHONE_NUMBER");

const twilioClient = new twilio.Twilio(twilioAccountSid.value(), twilioAuthToken.value());

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail.value(),
    pass: gmailAppPass.value(),
  },
});

export const sendEmailOtp = onRequest({cors: true}, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const {email} = req.body;

  if (!email) {
    res.status(400).send("Bad Request: Email is required.");
    return;
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = admin.firestore.Timestamp.now().toMillis() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to Firestore
    await db.collection("otps").doc(email).set({
      email,
      otp, // In a real app, you should hash this
      expires: admin.firestore.Timestamp.fromMillis(expires),
      verified: false,
    });

    const mailOptions = {
      from: `"${"Certificate System"}" <${gmailEmail.value()}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    logger.info(`OTP sent to ${email}`);
    res.status(200).send({success: true, message: "OTP sent successfully."});
  } catch (error) {
    logger.error("Error sending OTP:", error);
    res.status(500).send("Internal Server Error: Could not send OTP.");
  }
});

export const verifyEmailOtp = onRequest({cors: true}, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const {email, otp} = req.body;

  if (!email || !otp) {
    res.status(400).send("Bad Request: Email and OTP are required.");
    return;
  }

  try {
    const otpDocRef = db.collection("otps").doc(email);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      res.status(404).send({success: false, message: "OTP not found or expired."});
      return;
    }

    const otpData = otpDoc.data();
    if (!otpData) {
      res.status(404).send({success: false, message: "OTP data is invalid."});
      return;
    }

    const isExpired = admin.firestore.Timestamp.now().toMillis() > otpData.expires.toMillis();
    if (isExpired) {
      res.status(410).send({success: false, message: "OTP has expired."});
      return;
    }

    if (otpData.otp !== otp) {
      res.status(401).send({success: false, message: "Invalid OTP."});
      return;
    }

    if (otpData.verified) {
      res.status(409).send({success: true, message: "OTP has already been verified."});
      return;
    }

    await otpDocRef.update({verified: true});

    logger.info(`OTP verified for ${email}`);
    res.status(200).send({success: true, message: "OTP verified successfully."});
  } catch (error) {
    logger.error("Error verifying OTP:", error);
    res.status(500).send("Internal Server Error: Could not verify OTP.");
  }
});

export const sendSmsOtp = onRequest({cors: true}, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const {phone} = req.body;

  if (!phone) {
    res.status(400).send("Bad Request: Phone number is required.");
    return;
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = admin.firestore.Timestamp.now().toMillis() + 10 * 60 * 1000; // 10 minutes

    await db.collection("otps").doc(phone).set({
      phone,
      otp,
      expires: admin.firestore.Timestamp.fromMillis(expires),
      verified: false,
    });

    await twilioClient.messages.create({
      body: `Your verification code is ${otp}`,
      to: phone,
      from: twilioPhoneNumber.value(),
    });

    logger.info(`SMS OTP sent to ${phone}`);
    res.status(200).send({success: true, message: "SMS OTP sent successfully."});
  } catch (error) {
    logger.error("Error sending SMS OTP:", error);
    res.status(500).send("Internal Server Error: Could not send SMS OTP.");
  }
});

export const verifySmsOtp = onRequest({cors: true}, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const {phone, otp} = req.body;

  if (!phone || !otp) {
    res.status(400).send("Bad Request: Phone and OTP are required.");
    return;
  }

  try {
    const otpDocRef = db.collection("otps").doc(phone);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      res.status(404).send({success: false, message: "OTP not found or expired."});
      return;
    }

    const otpData = otpDoc.data();

    if (!otpData) {
      res.status(404).send({success: false, message: "OTP data is invalid."});
      return;
    }

    const isExpired = admin.firestore.Timestamp.now().toMillis() > otpData.expires.toMillis();
    if (isExpired) {
      res.status(410).send({success: false, message: "OTP has expired."});
      return;
    }

    if (otpData.otp !== otp) {
      res.status(401).send({success: false, message: "Invalid OTP."});
      return;
    }
    
    if (otpData.verified) {
      res.status(409).send({success: true, message: "OTP has already been verified."});
      return;
    }

    await otpDocRef.update({verified: true});

    logger.info(`SMS OTP verified for ${phone}`);
    res.status(200).send({success: true, message: "SMS OTP verified successfully."});
  } catch (error) {
    logger.error("Error verifying SMS OTP:", error);
    res.status(500).send("Internal Server Error: Could not verify SMS OTP.");
  }
});

export const generateCertificate = onRequest({cors: true}, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { name, workshop, email } = req.body;

  if (!name || !workshop) {
    res.status(400).send("Bad Request: Name and workshop are required.");
    return;
  }

  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSizeTitle = 28;
    const fontSizeText = 18;

    // Draw certificate title
    page.drawText('Certificate of Completion', {
      x: 60,
      y: height - 80,
      size: fontSizeTitle,
      font,
      color: rgb(0.2, 0.2, 0.7),
    });

    // Draw recipient name
    page.drawText(`This is to certify that`, {
      x: 60,
      y: height - 130,
      size: fontSizeText,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(name, {
      x: 60,
      y: height - 160,
      size: fontSizeText + 4,
      font,
      color: rgb(0.1, 0.3, 0.6),
    });
    page.drawText(`has successfully completed the workshop:`, {
      x: 60,
      y: height - 200,
      size: fontSizeText,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(workshop, {
      x: 60,
      y: height - 230,
      size: fontSizeText + 2,
      font,
      color: rgb(0.1, 0.3, 0.6),
    });

    // Draw date
    const dateStr = new Date().toLocaleDateString();
    page.drawText(`Date: ${dateStr}`, {
      x: 60,
      y: height - 280,
      size: 14,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Draw signature placeholder
    page.drawText('____________________', {
      x: width - 220,
      y: 60,
      size: 14,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText('Signature', {
      x: width - 180,
      y: 45,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    if (email) {
      // Send the PDF as an email attachment
      const mailOptions = {
        from: `"Certificate System" <${gmailEmail.value()}>`,
        to: email,
        subject: `Your Certificate for ${workshop}`,
        text: `Dear ${name},\n\nAttached is your certificate for completing the workshop: ${workshop}.\n\nCongratulations!`,
        attachments: [
          {
            filename: "certificate.pdf",
            content: Buffer.from(pdfBytes),
            contentType: "application/pdf"
          }
        ]
      };
      await transporter.sendMail(mailOptions);
      res.status(200).send({ success: true, message: "Certificate sent by email." });
    } else {
      // Return the PDF for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate.pdf"`);
      res.status(200).send(Buffer.from(pdfBytes));
    }
  } catch (error) {
    logger.error("Error generating certificate:", error);
    res.status(500).send("Internal Server Error: Could not generate certificate.");
  }
});

export const sendCertificateEmail = onDocumentUpdated("submissions/{submissionId}", async (event) => {
  const dataAfter = event.data?.after.data();
  const dataBefore = event.data?.before.data();

  if (!dataAfter) {
    logger.error("No data associated with the event after update.");
    return;
  }

  // Check if certificateUrl was just added
  if (dataBefore?.certificateUrl || !dataAfter.certificateUrl) {
    logger.info("No new certificate URL. Email not sent.");
    return;
  }

  const {email, name, certificateUrl} = dataAfter;

  try {
    const mailOptions = {
      from: `"${"Certificate System"}" <${gmailEmail.value()}>`,
      to: email,
      subject: "Your Workshop Certificate is Ready!",
      html: `
        <p>Hello ${name},</p>
        <p>Congratulations! Your certificate for the workshop is ready.</p>
        <p>You can download it here: <a href="${certificateUrl}">Download Certificate</a></p>
        <br>
        <p>Thank you for your participation.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Certificate email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send certificate email to ${email}:`, error);
  }
}); 