import ErrorHandler from "../middlewares/error.js";
import { Reservation } from "../models/reservation.js";
import sendMail from "../utility/mailSender.js";


const generateReservationEmailTemplate = (date, time, nameOfUser) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Reservation Confirmation</h2>
      <p>Dear ${nameOfUser},</p>
      <p>We are pleased to confirm your reservation at <strong>Hotel Silver Spoon</strong>.</p>
      <p><strong>Reservation Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <p>We look forward to serving you and hope you have a wonderful dining experience.</p>
      <p>If you have any questions or need to make any changes to your reservation, please contact us at (contact information).</p>
      <p>Thank you for choosing Hotel Silver Spoon!</p>
      <p>Best regards,</p>
      <p>Hotel Silver Spoon Team</p>
    </div>
  `;
};


const send_reservation = async (req, res, next) => {
  const { firstName, lastName, email, date, time, phone } = req.body;
  if (!firstName || !lastName || !email || !date || !time || !phone) {
    return next(new ErrorHandler("Please Fill Full Reservation Form!", 400));
  }

  try {
    console.log('in try')
    await Reservation.create({ firstName, lastName, email, date, time, phone });
    res.status(201).json({
      success: true,
      message: "Reservation Sent Successfully!",
    });
    const nameOfUser = `${firstName} ${lastName}`;
    const emailTemplate = generateReservationEmailTemplate(date, time, nameOfUser);
    sendMail(email, "Reservation Confirmation", emailTemplate);
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      console.log(error)
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return next(new ErrorHandler(validationErrors.join(', '), 400));
    }

    // Handle other errors
    return next(error);
  }
};


export default send_reservation;

